import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.database import get_db, format_note, now_iso
from backend.models import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=List[NoteResponse])
def get_notes(
    search: Optional[str] = Query(None, description="Search by title or content"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    pinned_only: Optional[bool] = Query(None, description="Only pinned notes"),
    todo_id: Optional[int] = Query(None, description="Filter by linked todo"),
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT n.*, t.title AS todo_title 
            FROM notes n
            LEFT JOIN todos t ON n.todo_id = t.id
            WHERE 1=1
        """
        params = []

        if search:
            query += " AND (n.title LIKE ? OR n.content LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term])

        if tag and tag != "all":
            query += " AND n.tags_json LIKE ?"
            params.append(f'%"{tag}"%')

        if pinned_only:
            query += " AND n.is_pinned = 1"

        if todo_id is not None:
            query += " AND n.todo_id = ?"
            params.append(todo_id)

        query += " ORDER BY n.is_pinned DESC, n.updated_at DESC, n.id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [format_note(row) for row in rows]


@router.post("", response_model=NoteResponse, status_code=201)
def create_note(payload: NoteCreate):
    t_now = now_iso()
    tags_json = json.dumps(payload.tags or [])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO notes (title, content, is_pinned, color, tags_json, todo_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                payload.title,
                payload.content or "",
                1 if payload.is_pinned else 0,
                payload.color or "default",
                tags_json,
                payload.todo_id,
                t_now,
                t_now,
            ),
        )
        note_id = cursor.lastrowid
        conn.commit()

        cursor.execute(
            """
            SELECT n.*, t.title AS todo_title
            FROM notes n
            LEFT JOIN todos t ON n.todo_id = t.id
            WHERE n.id = ?
        """,
            (note_id,),
        )
        row = cursor.fetchone()
        return format_note(row)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT n.*, t.title AS todo_title
            FROM notes n
            LEFT JOIN todos t ON n.todo_id = t.id
            WHERE n.id = ?
        """,
            (note_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Note not found")
        return format_note(row)


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, payload: NoteUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        updates = []
        params = []
        t_now = now_iso()

        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title)

        if payload.content is not None:
            updates.append("content = ?")
            params.append(payload.content)

        if payload.is_pinned is not None:
            updates.append("is_pinned = ?")
            params.append(1 if payload.is_pinned else 0)

        if payload.color is not None:
            updates.append("color = ?")
            params.append(payload.color)

        if payload.tags is not None:
            updates.append("tags_json = ?")
            params.append(json.dumps(payload.tags))

        if "todo_id" in payload.model_fields_set:
            updates.append("todo_id = ?")
            params.append(payload.todo_id)

        updates.append("updated_at = ?")
        params.append(t_now)
        params.append(note_id)

        if updates:
            sql = f"UPDATE notes SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(sql, params)
            conn.commit()

        cursor.execute(
            """
            SELECT n.*, t.title AS todo_title
            FROM notes n
            LEFT JOIN todos t ON n.todo_id = t.id
            WHERE n.id = ?
        """,
            (note_id,),
        )
        row = cursor.fetchone()
        return format_note(row)


@router.patch("/{note_id}/pin", response_model=NoteResponse)
def toggle_pin_note(note_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT is_pinned FROM notes WHERE id = ?", (note_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Note not found")

        new_pinned = 0 if row["is_pinned"] else 1
        t_now = now_iso()

        cursor.execute(
            "UPDATE notes SET is_pinned = ?, updated_at = ? WHERE id = ?",
            (new_pinned, t_now, note_id),
        )
        conn.commit()

        cursor.execute(
            """
            SELECT n.*, t.title AS todo_title
            FROM notes n
            LEFT JOIN todos t ON n.todo_id = t.id
            WHERE n.id = ?
        """,
            (note_id,),
        )
        updated_row = cursor.fetchone()
        return format_note(updated_row)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM notes WHERE id = ?", (note_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Note not found")

        cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        conn.commit()
    return None
