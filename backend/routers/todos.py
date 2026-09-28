import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.database import get_db, format_todo, now_iso
from backend.models import (
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    SubtaskCreate,
    SubtaskUpdate,
    SubtaskResponse,
)

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=List[TodoResponse])
def get_todos(
    search: Optional[str] = Query(None, description="Search by title or description"),
    status: Optional[str] = Query(None, description="Filter by status: todo, in_progress, completed"),
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high, urgent"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    sort_by: str = Query("created_at", description="Sort by: created_at, due_date, priority, title"),
    order: str = Query("desc", description="Sort order: asc or desc"),
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM todos WHERE 1=1"
        params = []

        if search:
            query += " AND (title LIKE ? OR description LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term])

        if status and status != "all":
            query += " AND status = ?"
            params.append(status)

        if priority and priority != "all":
            query += " AND priority = ?"
            params.append(priority)

        if tag and tag != "all":
            query += " AND tags_json LIKE ?"
            params.append(f'%"{tag}"%')

        valid_sort_fields = {
            "created_at": "created_at",
            "due_date": "COALESCE(due_date, '9999-12-31')",
            "title": "LOWER(title)",
            "priority": "CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5 END",
        }
        sort_col = valid_sort_fields.get(sort_by, "created_at")
        direction = "ASC" if order.lower() == "asc" else "DESC"

        query += f" ORDER BY {sort_col} {direction}, id DESC"
        cursor.execute(query, params)
        todo_rows = cursor.fetchall()

        results = []
        for row in todo_rows:
            # fetch subtasks
            cursor.execute(
                "SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC",
                (row["id"],),
            )
            subtasks = cursor.fetchall()

            # fetch linked notes count
            cursor.execute(
                "SELECT COUNT(*) FROM notes WHERE todo_id = ?",
                (row["id"],),
            )
            notes_count = cursor.fetchone()[0]

            results.append(format_todo(row, subtasks, notes_count))

        return results


@router.post("", response_model=TodoResponse, status_code=201)
def create_todo(payload: TodoCreate):
    t_now = now_iso()
    tags_json = json.dumps(payload.tags or [])
    completed_at = t_now if payload.status == "completed" else None

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO todos (title, description, priority, status, due_date, tags_json, completed_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                payload.title,
                payload.description or "",
                payload.priority,
                payload.status,
                payload.due_date,
                tags_json,
                completed_at,
                t_now,
                t_now,
            ),
        )
        todo_id = cursor.lastrowid

        subtasks_data = []
        if payload.subtasks:
            for st_title in payload.subtasks:
                if st_title.strip():
                    cursor.execute(
                        """
                        INSERT INTO subtasks (todo_id, title, is_completed, created_at)
                        VALUES (?, ?, 0, ?)
                    """,
                        (todo_id, st_title.strip(), t_now),
                    )

        conn.commit()

        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        cursor.execute("SELECT * FROM subtasks WHERE todo_id = ?", (todo_id,))
        st_rows = cursor.fetchall()

        return format_todo(row, st_rows, 0)


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Todo not found")

        cursor.execute("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC", (todo_id,))
        subtasks = cursor.fetchall()

        cursor.execute("SELECT COUNT(*) FROM notes WHERE todo_id = ?", (todo_id,))
        notes_count = cursor.fetchone()[0]

        return format_todo(row, subtasks, notes_count)


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, payload: TodoUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Todo not found")

        updates = []
        params = []
        t_now = now_iso()

        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title)

        if payload.description is not None:
            updates.append("description = ?")
            params.append(payload.description)

        if payload.priority is not None:
            updates.append("priority = ?")
            params.append(payload.priority)

        if payload.status is not None:
            updates.append("status = ?")
            params.append(payload.status)
            if payload.status == "completed" and row["status"] != "completed":
                updates.append("completed_at = ?")
                params.append(t_now)
            elif payload.status != "completed":
                updates.append("completed_at = NULL")

        if payload.due_date is not None:
            updates.append("due_date = ?")
            params.append(payload.due_date if payload.due_date else None)

        if payload.tags is not None:
            updates.append("tags_json = ?")
            params.append(json.dumps(payload.tags))

        updates.append("updated_at = ?")
        params.append(t_now)
        params.append(todo_id)

        if updates:
            sql = f"UPDATE todos SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(sql, params)
            conn.commit()

        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        updated_row = cursor.fetchone()

        cursor.execute("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC", (todo_id,))
        subtasks = cursor.fetchall()

        cursor.execute("SELECT COUNT(*) FROM notes WHERE todo_id = ?", (todo_id,))
        notes_count = cursor.fetchone()[0]

        return format_todo(updated_row, subtasks, notes_count)


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Todo not found")

        is_now_completed = row["status"] != "completed"
        new_status = "completed" if is_now_completed else "todo"
        t_now = now_iso()
        completed_at = t_now if is_now_completed else None

        cursor.execute(
            """
            UPDATE todos SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?
        """,
            (new_status, completed_at, t_now, todo_id),
        )
        conn.commit()

        cursor.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        updated_row = cursor.fetchone()

        cursor.execute("SELECT * FROM subtasks WHERE todo_id = ? ORDER BY id ASC", (todo_id,))
        subtasks = cursor.fetchall()

        cursor.execute("SELECT COUNT(*) FROM notes WHERE todo_id = ?", (todo_id,))
        notes_count = cursor.fetchone()[0]

        return format_todo(updated_row, subtasks, notes_count)


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM todos WHERE id = ?", (todo_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Todo not found")

        cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        conn.commit()
    return None


@router.post("/{todo_id}/subtasks", response_model=SubtaskResponse, status_code=201)
def add_subtask(todo_id: int, payload: SubtaskCreate):
    t_now = now_iso()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM todos WHERE id = ?", (todo_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Todo not found")

        cursor.execute(
            """
            INSERT INTO subtasks (todo_id, title, is_completed, created_at)
            VALUES (?, ?, ?, ?)
        """,
            (todo_id, payload.title.strip(), 1 if payload.is_completed else 0, t_now),
        )
        subtask_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM subtasks WHERE id = ?", (subtask_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "todo_id": row["todo_id"],
            "title": row["title"],
            "is_completed": bool(row["is_completed"]),
            "created_at": row["created_at"],
        }


@router.patch("/{todo_id}/subtasks/{subtask_id}", response_model=SubtaskResponse)
def update_subtask(todo_id: int, subtask_id: int, payload: SubtaskUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM subtasks WHERE id = ? AND todo_id = ?",
            (subtask_id, todo_id),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Subtask not found")

        updates = []
        params = []
        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title.strip())

        if payload.is_completed is not None:
            updates.append("is_completed = ?")
            params.append(1 if payload.is_completed else 0)

        if updates:
            params.extend([subtask_id, todo_id])
            cursor.execute(
                f"UPDATE subtasks SET {', '.join(updates)} WHERE id = ? AND todo_id = ?",
                params,
            )
            conn.commit()

        cursor.execute("SELECT * FROM subtasks WHERE id = ?", (subtask_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "todo_id": row["todo_id"],
            "title": row["title"],
            "is_completed": bool(row["is_completed"]),
            "created_at": row["created_at"],
        }


@router.delete("/{todo_id}/subtasks/{subtask_id}", status_code=204)
def delete_subtask(todo_id: int, subtask_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM subtasks WHERE id = ? AND todo_id = ?",
            (subtask_id, todo_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Subtask not found")

        cursor.execute("DELETE FROM subtasks WHERE id = ?", (subtask_id,))
        conn.commit()
    return None
