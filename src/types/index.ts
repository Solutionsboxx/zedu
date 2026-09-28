export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoStatus = 'todo' | 'in_progress' | 'completed';
export type NoteColor = 'default' | 'amber' | 'emerald' | 'indigo' | 'rose' | 'violet' | 'sky';

export interface Subtask {
  id: number;
  todo_id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: TodoStatus;
  due_date: string | null;
  tags: string[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  notes_count: number;
}

export interface TodoCreateInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TodoStatus;
  due_date?: string | null;
  tags?: string[];
  subtasks?: string[];
}

export interface TodoUpdateInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TodoStatus;
  due_date?: string | null;
  tags?: string[];
}

export interface Note {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  color: NoteColor;
  tags: string[];
  todo_id: number | null;
  todo_title?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteCreateInput {
  title: string;
  content?: string;
  is_pinned?: boolean;
  color?: NoteColor;
  tags?: string[];
  todo_id?: number | null;
}

export interface NoteUpdateInput {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  color?: NoteColor;
  tags?: string[];
  todo_id?: number | null;
}

export interface Stats {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  high_priority_todos: number;
  total_notes: number;
  pinned_notes: number;
  completion_rate: number;
}

export type ViewTab = 'all' | 'todos' | 'notes' | 'overview';
