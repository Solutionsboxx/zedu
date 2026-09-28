import {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
  Note,
  NoteCreateInput,
  NoteUpdateInput,
  Subtask,
  Stats,
} from '../types';

const BASE_URL = '/api';

// Initial rich seed data for local storage fallback
const INITIAL_TODOS: Todo[] = [
  {
    id: 1,
    title: 'Deploy FastAPI + Vite Productivity Suite',
    description: 'Verify all database endpoints, CORS settings, and frontend UI responsiveness.',
    priority: 'urgent',
    status: 'in_progress',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Overdue yesterday
    tags: ['devops', 'backend', 'v1.0'],
    completed_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    notes_count: 1,
    subtasks: [
      { id: 101, todo_id: 1, title: 'Verify SQLite schema and relations', is_completed: true, created_at: new Date().toISOString() },
      { id: 102, todo_id: 1, title: 'Configure Uvicorn ASGI runner on port 8001', is_completed: true, created_at: new Date().toISOString() },
      { id: 103, todo_id: 1, title: 'Test frontend proxy routing for /api and /docs', is_completed: false, created_at: new Date().toISOString() },
    ],
  },
  {
    id: 2,
    title: 'Review Sprint Velocity & Backlog Grooming',
    description: 'Assess completed story points and balance next milestone priorities.',
    priority: 'high',
    status: 'todo',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    tags: ['management', 'scrum'],
    completed_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    notes_count: 0,
    subtasks: [
      { id: 201, todo_id: 2, title: 'Compile burndown chart', is_completed: false, created_at: new Date().toISOString() },
      { id: 202, todo_id: 2, title: 'Tag overdue items for retrospective', is_completed: true, created_at: new Date().toISOString() },
    ],
  },
  {
    id: 3,
    title: 'Finalize Dark Theme Design Constitution',
    description: 'Ensure contrast ratios conform to WCAG AA specifications across all modals and tags.',
    priority: 'medium',
    status: 'completed',
    due_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    tags: ['design', 'ui', 'accessibility'],
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    notes_count: 1,
    subtasks: [
      { id: 301, todo_id: 3, title: 'Verify zinc and slate palette contrast', is_completed: true, created_at: new Date().toISOString() },
      { id: 302, todo_id: 3, title: 'Add focus-visible rings for keyboard navigation', is_completed: true, created_at: new Date().toISOString() },
    ],
  },
  {
    id: 4,
    title: 'Implement Subtask Quick Toggling & Progress Bars',
    description: 'Allow users to complete checklist items directly from the backlog view.',
    priority: 'high',
    status: 'in_progress',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: ['frontend', 'react'],
    completed_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    notes_count: 0,
    subtasks: [
      { id: 401, todo_id: 4, title: 'Add animated progress bar component', is_completed: true, created_at: new Date().toISOString() },
      { id: 402, todo_id: 4, title: 'Connect toggleSubtask API endpoint', is_completed: true, created_at: new Date().toISOString() },
    ],
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: 'Architecture Decisions (ADR-001)',
    content: 'Full-stack decoupling: FastAPI handles async business logic and SQLite transactions. Vite frontend communicates via clean typed REST interfaces with instant optimistic UI.',
    is_pinned: true,
    color: 'indigo',
    tags: ['architecture', 'backend', 'sqlite'],
    todo_id: 1,
    todo_title: 'Deploy FastAPI + Vite Productivity Suite',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Color Palettes & Micro-interactions',
    content: 'Card background: slate-900/80 with subtle slate-800 borders. Badges use translucent fills with matching borders for crisp hierarchy.',
    is_pinned: true,
    color: 'emerald',
    tags: ['design', 'css'],
    todo_id: null,
    todo_title: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Sprint 24 Retrospective Notes',
    content: 'Velocity improved by 22% after implementing optimistic state updates and modular dialogs. Next sprint focus: recurring cron reminders.',
    is_pinned: false,
    color: 'amber',
    tags: ['scrum', 'retrospective'],
    todo_id: 2,
    todo_title: 'Review Sprint Velocity & Backlog Grooming',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to access LocalStorage safe in all environments
class LocalDatabase {
  private todosKey = 'taskflow_todos_v2';
  private notesKey = 'taskflow_notes_v2';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(this.todosKey)) {
        localStorage.setItem(this.todosKey, JSON.stringify(INITIAL_TODOS));
      }
      if (!localStorage.getItem(this.notesKey)) {
        localStorage.setItem(this.notesKey, JSON.stringify(INITIAL_NOTES));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  getTodos(): Todo[] {
    try {
      const data = localStorage.getItem(this.todosKey);
      return data ? JSON.parse(data) : INITIAL_TODOS;
    } catch {
      return INITIAL_TODOS;
    }
  }

  saveTodos(todos: Todo[]) {
    try {
      localStorage.setItem(this.todosKey, JSON.stringify(todos));
    } catch {
      // ignore
    }
  }

  getNotes(): Note[] {
    try {
      const data = localStorage.getItem(this.notesKey);
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  }

  saveNotes(notes: Note[]) {
    try {
      localStorage.setItem(this.notesKey, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }

  reset() {
    this.saveTodos(INITIAL_TODOS);
    this.saveNotes(INITIAL_NOTES);
  }
}

const localDb = new LocalDatabase();

// Flag to track backend availability
let backendAvailable = true;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 204) {
      backendAvailable = true;
      return {} as T;
    }

    if (!response.ok) {
      // 401 or 502 means backend proxy failed to connect to FastAPI
      if (response.status === 401 || response.status === 502 || response.status === 503) {
        backendAvailable = false;
      }
      let errorDetail = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // ignore
      }
      throw new Error(errorDetail);
    }

    backendAvailable = true;
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    backendAvailable = false;
    throw err;
  }
}

export const api = {
  // Check if currently operating with live FastAPI backend
  isBackendConnected(): boolean {
    return backendAvailable;
  },

  // Health & Stats
  async getHealth(): Promise<{ status: string; service: string; version: string; docs: string }> {
    try {
      return await request('/health');
    } catch {
      return {
        status: 'healthy-local',
        service: 'TaskFlow Local Engine (Storage Fallback)',
        version: '1.0.0',
        docs: '/docs',
      };
    }
  },

  async getStats(): Promise<Stats> {
    try {
      return await request('/stats');
    } catch {
      const todos = localDb.getTodos();
      const notes = localDb.getNotes();
      const total = todos.length;
      const completed = todos.filter((t) => t.status === 'completed').length;
      const pending = total - completed;
      const highPriority = todos.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;
      const pinnedNotes = notes.filter((n) => n.is_pinned).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total_todos: total,
        completed_todos: completed,
        pending_todos: pending,
        high_priority_todos: highPriority,
        total_notes: notes.length,
        pinned_notes: pinnedNotes,
        completion_rate: completionRate,
      };
    }
  },

  async getTags(): Promise<string[]> {
    try {
      return await request('/tags');
    } catch {
      const todos = localDb.getTodos();
      const notes = localDb.getNotes();
      const tagSet = new Set<string>();
      todos.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
      notes.forEach((n) => n.tags.forEach((tag) => tagSet.add(tag)));
      return Array.from(tagSet).sort();
    }
  },

  async resetData(): Promise<{ message: string }> {
    try {
      const res = await request<{ message: string }>('/reset', { method: 'POST' });
      localDb.reset();
      return res;
    } catch {
      localDb.reset();
      return { message: 'Database reset to demo state' };
    }
  },

  // Todos
  async getTodos(params?: {
    search?: string;
    status?: string;
    priority?: string;
    tag?: string;
    sort_by?: string;
    order?: string;
  }): Promise<Todo[]> {
    try {
      const query = new URLSearchParams();
      if (params) {
        if (params.search) query.append('search', params.search);
        if (params.status && params.status !== 'all') query.append('status', params.status);
        if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
        if (params.tag && params.tag !== 'all') query.append('tag', params.tag);
        if (params.sort_by) query.append('sort_by', params.sort_by);
        if (params.order) query.append('order', params.order);
      }
      const qStr = query.toString();
      return await request(`/todos${qStr ? `?${qStr}` : ''}`);
    } catch {
      let list = localDb.getTodos();
      if (params) {
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
        }
        if (params.status && params.status !== 'all') {
          list = list.filter((t) => t.status === params.status);
        }
        if (params.priority && params.priority !== 'all') {
          list = list.filter((t) => t.priority === params.priority);
        }
        if (params.tag && params.tag !== 'all') {
          list = list.filter((t) => t.tags.includes(params.tag!));
        }
        // Sorting
        const sortBy = params.sort_by || 'created_at';
        const order = params.order || 'desc';
        list.sort((a, b) => {
          let valA: any = (a as any)[sortBy] || '';
          let valB: any = (b as any)[sortBy] || '';
          if (sortBy === 'priority') {
            const weights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
            valA = weights[a.priority] || 0;
            valB = weights[b.priority] || 0;
          }
          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return list;
    }
  },

  async getTodo(id: number): Promise<Todo> {
    try {
      return await request(`/todos/${id}`);
    } catch {
      const found = localDb.getTodos().find((t) => t.id === id);
      if (!found) throw new Error('Task not found');
      return found;
    }
  },

  async createTodo(data: TodoCreateInput): Promise<Todo> {
    try {
      return await request('/todos', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const todos = localDb.getTodos();
      const newId = Date.now();
      const now = new Date().toISOString();
      const newSubtasks: Subtask[] = (data.subtasks || []).map((title, idx) => ({
        id: newId + idx + 1,
        todo_id: newId,
        title,
        is_completed: false,
        created_at: now,
      }));

      const newTodo: Todo = {
        id: newId,
        title: data.title,
        description: data.description || '',
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        due_date: data.due_date || null,
        tags: data.tags || [],
        completed_at: null,
        created_at: now,
        updated_at: now,
        subtasks: newSubtasks,
        notes_count: 0,
      };

      todos.unshift(newTodo);
      localDb.saveTodos(todos);
      return newTodo;
    }
  },

  async updateTodo(id: number, data: TodoUpdateInput): Promise<Todo> {
    try {
      return await request(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const todos = localDb.getTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found');

      const existing = todos[index];
      const updated: Todo = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };
      if (data.status === 'completed' && existing.status !== 'completed') {
        updated.completed_at = new Date().toISOString();
      } else if (data.status && data.status !== 'completed') {
        updated.completed_at = null;
      }
      todos[index] = updated;
      localDb.saveTodos(todos);
      return updated;
    }
  },

  async toggleTodo(id: number): Promise<Todo> {
    try {
      return await request(`/todos/${id}/toggle`, {
        method: 'PATCH',
      });
    } catch {
      const todos = localDb.getTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found');

      const target = todos[index];
      const isNowCompleted = target.status !== 'completed';
      const updated: Todo = {
        ...target,
        status: isNowCompleted ? 'completed' : 'todo',
        completed_at: isNowCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      todos[index] = updated;
      localDb.saveTodos(todos);
      return updated;
    }
  },

  async deleteTodo(id: number): Promise<void> {
    try {
      await request(`/todos/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const todos = localDb.getTodos().filter((t) => t.id !== id);
      localDb.saveTodos(todos);
    }
  },

  // Subtasks
  async addSubtask(todoId: number, title: string): Promise<Subtask> {
    try {
      return await request(`/todos/${todoId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title, is_completed: false }),
      });
    } catch {
      const todos = localDb.getTodos();
      const target = todos.find((t) => t.id === todoId);
      if (!target) throw new Error('Task not found');

      const subtask: Subtask = {
        id: Date.now(),
        todo_id: todoId,
        title,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      target.subtasks.push(subtask);
      localDb.saveTodos(todos);
      return subtask;
    }
  },

  async updateSubtask(
    todoId: number,
    subtaskId: number,
    data: { title?: string; is_completed?: boolean }
  ): Promise<Subtask> {
    try {
      return await request(`/todos/${todoId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch {
      const todos = localDb.getTodos();
      const target = todos.find((t) => t.id === todoId);
      if (!target) throw new Error('Task not found');
      const st = target.subtasks.find((s) => s.id === subtaskId);
      if (!st) throw new Error('Subtask not found');

      if (data.title !== undefined) st.title = data.title;
      if (data.is_completed !== undefined) st.is_completed = data.is_completed;
      localDb.saveTodos(todos);
      return st;
    }
  },

  async deleteSubtask(todoId: number, subtaskId: number): Promise<void> {
    try {
      await request(`/todos/${todoId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });
    } catch {
      const todos = localDb.getTodos();
      const target = todos.find((t) => t.id === todoId);
      if (target) {
        target.subtasks = target.subtasks.filter((s) => s.id !== subtaskId);
        localDb.saveTodos(todos);
      }
    }
  },

  // Notes
  async getNotes(params?: {
    search?: string;
    tag?: string;
    pinned_only?: boolean;
    todo_id?: number;
  }): Promise<Note[]> {
    try {
      const query = new URLSearchParams();
      if (params) {
        if (params.search) query.append('search', params.search);
        if (params.tag && params.tag !== 'all') query.append('tag', params.tag);
        if (params.pinned_only) query.append('pinned_only', 'true');
        if (params.todo_id !== undefined) query.append('todo_id', String(params.todo_id));
      }
      const qStr = query.toString();
      return await request(`/notes${qStr ? `?${qStr}` : ''}`);
    } catch {
      let list = localDb.getNotes();
      if (params) {
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter((n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
        }
        if (params.tag && params.tag !== 'all') {
          list = list.filter((n) => n.tags.includes(params.tag!));
        }
        if (params.pinned_only) {
          list = list.filter((n) => n.is_pinned);
        }
        if (params.todo_id !== undefined) {
          list = list.filter((n) => n.todo_id === params.todo_id);
        }
      }
      // Pinned notes first
      return list.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    }
  },

  async getNote(id: number): Promise<Note> {
    try {
      return await request(`/notes/${id}`);
    } catch {
      const note = localDb.getNotes().find((n) => n.id === id);
      if (!note) throw new Error('Note not found');
      return note;
    }
  },

  async createNote(data: NoteCreateInput): Promise<Note> {
    try {
      return await request('/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const notes = localDb.getNotes();
      const todos = localDb.getTodos();
      let linkedTodoTitle: string | null = null;
      if (data.todo_id) {
        const found = todos.find((t) => t.id === data.todo_id);
        if (found) linkedTodoTitle = found.title;
      }

      const newNote: Note = {
        id: Date.now(),
        title: data.title,
        content: data.content || '',
        is_pinned: data.is_pinned || false,
        color: data.color || 'default',
        tags: data.tags || [],
        todo_id: data.todo_id || null,
        todo_title: linkedTodoTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      notes.unshift(newNote);
      localDb.saveNotes(notes);
      return newNote;
    }
  },

  async updateNote(id: number, data: NoteUpdateInput): Promise<Note> {
    try {
      return await request(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const notes = localDb.getNotes();
      const index = notes.findIndex((n) => n.id === id);
      if (index === -1) throw new Error('Note not found');

      const existing = notes[index];
      const updated: Note = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };
      notes[index] = updated;
      localDb.saveNotes(notes);
      return updated;
    }
  },

  async togglePinNote(id: number): Promise<Note> {
    try {
      return await request(`/notes/${id}/pin`, {
        method: 'PATCH',
      });
    } catch {
      const notes = localDb.getNotes();
      const index = notes.findIndex((n) => n.id === id);
      if (index === -1) throw new Error('Note not found');

      notes[index].is_pinned = !notes[index].is_pinned;
      notes[index].updated_at = new Date().toISOString();
      localDb.saveNotes(notes);
      return notes[index];
    }
  },

  async deleteNote(id: number): Promise<void> {
    try {
      await request(`/notes/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const notes = localDb.getNotes().filter((n) => n.id !== id);
      localDb.saveNotes(notes);
    }
  },
};
