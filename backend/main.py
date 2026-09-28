import json
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db, get_db, seed_initial_data
from backend.models import StatsResponse
from backend.routers import todos, notes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    init_db()
    yield


app = FastAPI(
    title="To-Do & Notes API",
    description="Python FastAPI backend providing persistent task management, subtasks, notes, and productivity statistics.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# Enable CORS for development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(todos.router, prefix="/api")
app.include_router(notes.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI To-Do & Notes Service",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM todos")
        total_todos = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM todos WHERE status = 'completed'")
        completed_todos = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM todos WHERE status != 'completed'")
        pending_todos = cursor.fetchone()[0]

        cursor.execute(
            "SELECT COUNT(*) FROM todos WHERE priority IN ('high', 'urgent') AND status != 'completed'"
        )
        high_priority_todos = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM notes")
        total_notes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM notes WHERE is_pinned = 1")
        pinned_notes = cursor.fetchone()[0]

        rate = (completed_todos / total_todos * 100.0) if total_todos > 0 else 0.0

        return {
            "total_todos": total_todos,
            "completed_todos": completed_todos,
            "pending_todos": pending_todos,
            "high_priority_todos": high_priority_todos,
            "total_notes": total_notes,
            "pinned_notes": pinned_notes,
            "completion_rate": round(rate, 1),
        }


@app.get("/api/tags", response_model=List[str])
def get_tags():
    tags_set = set()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT tags_json FROM todos WHERE tags_json IS NOT NULL")
        for row in cursor.fetchall():
            try:
                for t in json.loads(row[0]):
                    if t.strip():
                        tags_set.add(t.strip())
            except Exception:
                pass

        cursor.execute("SELECT tags_json FROM notes WHERE tags_json IS NOT NULL")
        for row in cursor.fetchall():
            try:
                for t in json.loads(row[0]):
                    if t.strip():
                        tags_set.add(t.strip())
            except Exception:
                pass

    return sorted(list(tags_set))


@app.post("/api/reset")
def reset_database():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM subtasks")
        cursor.execute("DELETE FROM notes")
        cursor.execute("DELETE FROM todos")
        seed_initial_data(cursor)
        conn.commit()
    return {"message": "Database successfully reset with demo seed data"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
