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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
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

  return response.json();
}

export const api = {
  // Health & Stats
  async getHealth(): Promise<{ status: string; service: string; version: string; docs: string }> {
    return request('/health');
  },

  async getStats(): Promise<Stats> {
    return request('/stats');
  },

  async getTags(): Promise<string[]> {
    return request('/tags');
  },

  async resetData(): Promise<{ message: string }> {
    return request('/reset', { method: 'POST' });
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
    return request(`/todos${qStr ? `?${qStr}` : ''}`);
  },

  async getTodo(id: number): Promise<Todo> {
    return request(`/todos/${id}`);
  },

  async createTodo(data: TodoCreateInput): Promise<Todo> {
    return request('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTodo(id: number, data: TodoUpdateInput): Promise<Todo> {
    return request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleTodo(id: number): Promise<Todo> {
    return request(`/todos/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async deleteTodo(id: number): Promise<void> {
    return request(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  // Subtasks
  async addSubtask(todoId: number, title: string): Promise<Subtask> {
    return request(`/todos/${todoId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title, is_completed: false }),
    });
  },

  async updateSubtask(
    todoId: number,
    subtaskId: number,
    data: { title?: string; is_completed?: boolean }
  ): Promise<Subtask> {
    return request(`/todos/${todoId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteSubtask(todoId: number, subtaskId: number): Promise<void> {
    return request(`/todos/${todoId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    });
  },

  // Notes
  async getNotes(params?: {
    search?: string;
    tag?: string;
    pinned_only?: boolean;
    todo_id?: number;
  }): Promise<Note[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append('search', params.search);
      if (params.tag && params.tag !== 'all') query.append('tag', params.tag);
      if (params.pinned_only) query.append('pinned_only', 'true');
      if (params.todo_id !== undefined) query.append('todo_id', String(params.todo_id));
    }
    const qStr = query.toString();
    return request(`/notes${qStr ? `?${qStr}` : ''}`);
  },

  async getNote(id: number): Promise<Note> {
    return request(`/notes/${id}`);
  },

  async createNote(data: NoteCreateInput): Promise<Note> {
    return request('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: number, data: NoteUpdateInput): Promise<Note> {
    return request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async togglePinNote(id: number): Promise<Note> {
    return request(`/notes/${id}/pin`, {
      method: 'PATCH',
    });
  },

  async deleteNote(id: number): Promise<void> {
    return request(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};
