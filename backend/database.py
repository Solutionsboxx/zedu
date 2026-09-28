import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

DB_FILE = Path(__file__).resolve().parent / "todos_notes.db"


def get_db():
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'todo',
                due_date TEXT,
                tags_json TEXT DEFAULT '[]',
                completed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subtasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                todo_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                is_completed INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE CASCADE
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                is_pinned INTEGER DEFAULT 0,
                color TEXT DEFAULT 'default',
                tags_json TEXT DEFAULT '[]',
                todo_id INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (todo_id) REFERENCES todos (id) ON DELETE SET NULL
            )
        """)

        # Check if empty, seed initial helpful todos & notes
        cursor.execute("SELECT COUNT(*) FROM todos")
        todos_count = cursor.fetchone()[0]

        if todos_count == 0:
            seed_initial_data(cursor)

        conn.commit()


def seed_initial_data(cursor: sqlite3.Cursor):
    t_now = now_iso()
    initial_todos = [
        (
            "Review Python FastAPI & React Architecture",
            "Verify all API endpoints, async routers, and frontend interactive components are cleanly integrated.",
            "urgent",
            "completed",
            "2026-09-28",
            json.dumps(["Architecture", "Backend", "FastAPI"]),
            t_now,
            t_now,
            t_now,
            [
                ("Expose OpenAPI schema at /docs", 1),
                ("Configure SQLite schema with foreign key cascades", 1),
                ("Establish client-side optimistic synchronization", 1),
            ],
        ),
        (
            "Prepare Sprint Release Notes",
            "Document newly added rich markdown notes, priority filters, and subtask tracking capabilities.",
            "high",
            "todo",
            "2026-09-29",
            json.dumps(["Documentation", "Sprint"]),
            None,
            t_now,
            t_now,
            [
                ("Draft release highlights", 0),
                ("Review documentation checklist in AGENTS.md", 1),
                ("Gather user feedback on color tagging", 0),
            ],
        ),
        (
            "Design Dark/Light Glassmorphism Theme",
            "Refine typography, card contrast, responsive layouts, and smooth transition animations.",
            "medium",
            "in_progress",
            "2026-09-30",
            json.dumps(["UI/UX", "Tailwind"]),
            None,
            t_now,
            t_now,
            [
                ("Add pastel color badges for notes", 1),
                ("Configure keyboard navigation (Esc to close, Enter to submit)", 0),
            ],
        ),
        (
            "Set Up Automated Backups for SQLite",
            "Ensure periodic snapshots of todos_notes.db for safety and easy data export.",
            "low",
            "todo",
            "2026-10-05",
            json.dumps(["DevOps", "Database"]),
            None,
            t_now,
            t_now,
            [],
        ),
    ]

    for title, desc, prio, status, due, tags_j, comp_at, created, updated, subtasks in initial_todos:
        cursor.execute(
            """
            INSERT INTO todos (title, description, priority, status, due_date, tags_json, completed_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (title, desc, prio, status, due, tags_j, comp_at, created, updated),
        )
        todo_id = cursor.lastrowid
        for st_title, st_done in subtasks:
            cursor.execute(
                """
                INSERT INTO subtasks (todo_id, title, is_completed, created_at)
                VALUES (?, ?, ?, ?)
            """,
                (todo_id, st_title, st_done, t_now),
            )

    initial_notes = [
        (
            "🚀 Welcome to To-Do & Notes with FastAPI",
            """# FastAPI + Modern React To-Do & Notes
This workspace is backed by a real **Python FastAPI** backend running SQLite.

### Key Capabilities:
- **Comprehensive Task Management**: Priorities, subtask checklists, status workflows (Todo, In Progress, Completed), and tags.
- **Rich Note Taking**: Pinned notes, customizable color palettes, task linking, and full-text search.
- **Interactive API Documentation**: Explore the live Swagger UI directly at `/docs`!
- **Zero Latency**: Real-time optimistic UI updates coupled with robust server validation.

*Tip: Click the pin icon to keep this note at the top of your workspace!*""",
            1,
            "indigo",
            json.dumps(["Welcome", "Guide", "FastAPI"]),
            1,
            t_now,
            t_now,
        ),
        (
            "💡 Brainstorming: Features for v2",
            """- [ ] Voice memo transcription
- [x] Subtask drag and drop
- [ ] Export to Markdown & JSON
- [ ] Custom filter presets & smart lists
- [x] Color-coded sticky note cards""",
            1,
            "amber",
            json.dumps(["Ideas", "Roadmap"]),
            2,
            t_now,
            t_now,
        ),
        (
            "📋 Weekly Standup Talking Points",
            """### Accomplishments
1. Integrated Python FastAPI with seamless client routing.
2. Verified AGENTS.md instructions for autonomous development workflows.
3. Created responsive split-pane task & notes view.

### Blockers
None! Backend API is operational and healthy.""",
            0,
            "emerald",
            json.dumps(["Meeting", "Work"]),
            None,
            t_now,
            t_now,
        ),
    ]

    for title, content, is_pinned, color, tags_j, todo_id, created, updated in initial_notes:
        cursor.execute(
            """
            INSERT INTO notes (title, content, is_pinned, color, tags_json, todo_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (title, content, is_pinned, color, tags_j, todo_id, created, updated),
        )


def format_todo(row: sqlite3.Row, subtask_rows: List[sqlite3.Row] = None, notes_count: int = 0) -> Dict[str, Any]:
    subtasks = []
    if subtask_rows:
        for st in subtask_rows:
            subtasks.append(
                {
                    "id": st["id"],
                    "todo_id": st["todo_id"],
                    "title": st["title"],
                    "is_completed": bool(st["is_completed"]),
                    "created_at": st["created_at"],
                }
            )

    tags = []
    if row["tags_json"]:
        try:
            tags = json.loads(row["tags_json"])
        except Exception:
            tags = []

    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"] or "",
        "priority": row["priority"],
        "status": row["status"],
        "due_date": row["due_date"],
        "tags": tags,
        "completed_at": row["completed_at"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "subtasks": subtasks,
        "notes_count": notes_count,
    }


def format_note(row: sqlite3.Row) -> Dict[str, Any]:
    tags = []
    if row["tags_json"]:
        try:
            tags = json.loads(row["tags_json"])
        except Exception:
            tags = []

    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"] or "",
        "is_pinned": bool(row["is_pinned"]),
        "color": row["color"] or "default",
        "tags": tags,
        "todo_id": row["todo_id"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "todo_title": row["todo_title"] if "todo_title" in row.keys() else None,
    }


# Automatically initialize the database tables on import
init_db()

