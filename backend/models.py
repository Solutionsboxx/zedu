from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SubtaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    is_completed: bool = False


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    is_completed: Optional[bool] = None


class SubtaskResponse(SubtaskBase):
    id: int
    todo_id: int
    created_at: str


class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = ""
    priority: str = Field("medium", pattern="^(low|medium|high|urgent)$")
    status: str = Field("todo", pattern="^(todo|in_progress|completed)$")
    due_date: Optional[str] = None
    tags: List[str] = []


class TodoCreate(TodoBase):
    subtasks: Optional[List[str]] = []


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    status: Optional[str] = Field(None, pattern="^(todo|in_progress|completed)$")
    due_date: Optional[str] = None
    tags: Optional[List[str]] = None


class TodoResponse(TodoBase):
    id: int
    completed_at: Optional[str] = None
    created_at: str
    updated_at: str
    subtasks: List[SubtaskResponse] = []
    notes_count: int = 0


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = ""
    is_pinned: bool = False
    color: str = "default"  # default, amber, emerald, indigo, rose, violet, sky
    tags: List[str] = []
    todo_id: Optional[int] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    is_pinned: Optional[bool] = None
    color: Optional[str] = None
    tags: Optional[List[str]] = None
    todo_id: Optional[int] = None


class NoteResponse(NoteBase):
    id: int
    created_at: str
    updated_at: str
    todo_title: Optional[str] = None


class StatsResponse(BaseModel):
    total_todos: int
    completed_todos: int
    pending_todos: int
    high_priority_todos: int
    total_notes: int
    pinned_notes: int
    completion_rate: float
