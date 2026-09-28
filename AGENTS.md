# AGENTS.md - Multi-Agent System & Developer Guide

Welcome to the **TaskFlow: To-Do & Notes** project. This document serves as the authoritative guide for AI coding agents, autonomous workers, and software engineers collaborating on this codebase.

---

## 1. System Architecture Overview

This project is a high-performance full-stack productivity workspace combining a reactive modern frontend with an asynchronous Python FastAPI service.

```
+-----------------------------------------------------------+
|                   Vite Frontend (Port 3000)               |
|  - React 19 + TypeScript + Tailwind CSS                   |
|  - Optimistic UI state & reactive synchronization         |
|  - Split-pane / modal views for todos, subtasks, & notes   |
+-----------------------------+-----------------------------+
                              | Proxies /api and /docs
                              v
+-----------------------------------------------------------+
|               Python FastAPI Backend (Port 8001)          |
|  - ASGI Server (Uvicorn) with async routing               |
|  - Pydantic v2 schemas for strict data validation         |
|  - SQLite (WAL mode, foreign keys, cascades)              |
|  - OpenAPI / Swagger documentation at /docs               |
+-----------------------------------------------------------+
```

### Directory Structure

```
/
├── AGENTS.md                  # Autonomous agent guidelines & repository spec
├── backend/                   # Python FastAPI backend
│   ├── __init__.py
│   ├── main.py                # FastAPI app, CORS, routes & lifespan handler
│   ├── database.py            # SQLite schema, connection management, seeders
│   ├── models.py              # Pydantic v2 models & validation schemas
│   └── routers/
│       ├── __init__.py
│       ├── todos.py           # To-Do CRUD, status toggling, subtasks
│       └── notes.py           # Notes CRUD, pin/unpin, color coding, task links
├── requirements.txt           # Python backend dependencies
├── package.json               # Node.js dependencies & scripts
├── vite.config.ts             # Vite configuration with FastAPI auto-spawner
├── index.html                 # HTML shell with synchronized meta tags
├── metadata.json              # AI Studio applet metadata
└── src/
    ├── main.tsx               # Client entry point
    ├── App.tsx                # Main application container & view manager
    ├── index.css              # Global styles & Tailwind imports
    ├── types/                 # Shared TypeScript interfaces
    │   └── index.ts
    ├── services/              # API communication layer
    │   └── api.ts
    └── components/            # Modular React components
        ├── Header.tsx         # App brand, connection badge, quick actions
        ├── StatsCards.tsx     # Progress indicators & summary metrics
        ├── TodoList.tsx       # Filterable to-do list with subtasks
        ├── TodoModal.tsx      # Modal for creating/editing todos
        ├── NoteGrid.tsx       # Masonry-style notes cards
        ├── NoteModal.tsx      # Rich note editor with color selection
        └── FilterBar.tsx      # Tag filters, priority filters, search box
```

---

## 2. Agent Personas & Protocols

When an AI agent interacts with this repository, it must adhere to one of the following specialized operational roles:

### 1. Backend Engineer Agent
* **Scope**: `backend/` directory, `requirements.txt`.
* **Rules**:
  - Always validate incoming payloads with Pydantic models.
  - Ensure foreign key constraints are enforced (`PRAGMA foreign_keys = ON`).
  - Maintain idempotent routes where appropriate (e.g. `PUT`, `DELETE`).
  - Keep database queries parameterized to prevent SQL injection.
  - Return clear HTTP status codes (`201` for creation, `204` for deletion, `404` for not found).

### 2. Frontend Engineer Agent
* **Scope**: `src/` directory, `index.html`, Tailwind classes.
* **Rules**:
  - Implement optimistic UI updates so the user perceives immediate response times.
  - Provide fallback error alerts or undo mechanisms if backend requests fail.
  - Respect keyboard accessibility (e.g. `Enter` to submit, `Esc` to dismiss modals).
  - Use responsive layout primitives that scale cleanly from mobile screens to desktop widths.

### 3. QA & Verification Agent
* **Scope**: Full system integration, automated checks.
* **Rules**:
  - Verify that `compile_applet` succeeds without TypeScript or bundling errors.
  - Test backend endpoints using Python `TestClient` or `curl`.
  - Validate that Swagger documentation is accessible at `/docs`.

---

## 3. API Contract Specification

All endpoints are hosted with the `/api` prefix.

### Health & Analytics
* `GET /api/health` -> Returns service health status and version.
* `GET /api/stats` -> Returns task completion counts, active tasks, pinned notes, and completion rate.
* `GET /api/tags` -> Returns a deduplicated list of all tags currently in use across todos and notes.
* `POST /api/reset` -> Clears and repopulates the SQLite database with rich demo seed data.

### To-Dos & Subtasks (`/api/todos`)
* `GET /api/todos`
  - Query parameters:
    - `search` (string): Search in title or description.
    - `status` ("todo" | "in_progress" | "completed" | "all").
    - `priority` ("low" | "medium" | "high" | "urgent" | "all").
    - `tag` (string): Filter by tag.
    - `sort_by` ("created_at" | "due_date" | "priority" | "title").
    - `order` ("asc" | "desc").
* `POST /api/todos` -> Creates a new to-do item with optional subtasks.
* `GET /api/todos/{id}` -> Returns a single to-do with its subtasks and linked notes count.
* `PUT /api/todos/{id}` -> Updates to-do fields (title, description, priority, status, due_date, tags).
* `PATCH /api/todos/{id}/toggle` -> Toggles status between "completed" and "todo", automatically recording `completed_at`.
* `DELETE /api/todos/{id}` -> Deletes the to-do and its associated subtasks (cascade).
* `POST /api/todos/{id}/subtasks` -> Adds a checklist subtask to the to-do.
* `PATCH /api/todos/{id}/subtasks/{subtask_id}` -> Updates subtask title or toggle completion.
* `DELETE /api/todos/{id}/subtasks/{subtask_id}` -> Removes a subtask.

### Notes (`/api/notes`)
* `GET /api/notes`
  - Query parameters:
    - `search` (string): Search in note title or content.
    - `tag` (string): Filter by tag.
    - `pinned_only` (boolean): Return only pinned notes.
    - `todo_id` (integer): Filter notes attached to a specific to-do.
* `POST /api/notes` -> Creates a note with color, tags, and optional link to a to-do.
* `GET /api/notes/{id}` -> Returns note details.
* `PUT /api/notes/{id}` -> Updates note content, title, tags, or color.
* `PATCH /api/notes/{id}/pin` -> Toggles pinned flag.
* `DELETE /api/notes/{id}` -> Deletes note.

---

## 4. Development & Runtime Guidelines

### Starting Backend and Frontend
1. **Python dependencies**:
   ```bash
   python3 -m pip install -r requirements.txt
   ```
2. **Start FastAPI standalone**:
   ```bash
   python3 -m uvicorn backend.main:app --port 8001 --reload
   ```
3. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```
   *Vite automatically spawns the FastAPI process on port 8001 and proxies `/api` and `/docs` seamlessly.*

### Automated Verification Checklist for Agents
Before completing any task, ensure:
1. `backend/database.py` tables are properly structured and auto-initialized.
2. `compile_applet` succeeds cleanly.
3. No broken UI elements or missing error states.
4. `AGENTS.md` is kept up-to-date with any schema changes.
