import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Todo, Priority, TodoStatus } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onAddSubtask: (todoId: number, title: string) => Promise<void>;
  onToggleSubtask: (todoId: number, subtaskId: number, currentCompleted: boolean) => Promise<void>;
  onDeleteSubtask: (todoId: number, subtaskId: number) => Promise<void>;
  onViewNotesForTodo?: (todoId: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onViewNotesForTodo,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);

  const isCompleted = todo.status === 'completed';
  const completedSubtasks = todo.subtasks.filter((st) => st.is_completed).length;
  const totalSubtasks = todo.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Check if overdue
  const isOverdue =
    Boolean(todo.due_date) &&
    !isCompleted &&
    new Date(`${todo.due_date}T23:59:59`) < new Date();

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || submittingSubtask) return;

    try {
      setSubmittingSubtask(true);
      await onAddSubtask(todo.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
            LOW
          </span>
        );
    }
  };

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
          : isOverdue
          ? 'bg-rose-950/25 border-rose-500/50 shadow-md shadow-rose-500/10 hover:border-rose-400 ring-1 ring-rose-500/20'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Toggle Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : isOverdue
              ? 'border-rose-500/70 hover:border-rose-400 bg-rose-950/40'
              : 'border-slate-600 hover:border-indigo-400 bg-slate-800/50'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h3
              onClick={() => onEdit(todo)}
              className={`text-sm font-semibold cursor-pointer hover:text-indigo-400 transition truncate ${
                isCompleted
                  ? 'line-through text-slate-500'
                  : isOverdue
                  ? 'text-rose-100 hover:text-rose-300'
                  : 'text-white'
              }`}
            >
              {todo.title}
            </h3>

            {/* Overdue Badge */}
            {isOverdue && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-xs shadow-rose-500/30 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>OVERDUE</span>
              </span>
            )}

            {/* Priority Badge */}
            {getPriorityBadge(todo.priority)}

            {/* Status indicator if in progress */}
            {todo.status === 'in_progress' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                IN PROGRESS
              </span>
            )}

            {/* Linked Notes Badge */}
            {todo.notes_count > 0 && (
              <button
                onClick={() => onViewNotesForTodo && onViewNotesForTodo(todo.id)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition"
                title={`${todo.notes_count} note(s) linked to this task`}
              >
                <FileText className="w-3 h-3" />
                <span>{todo.notes_count} Note{todo.notes_count > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>

          {/* Description */}
          {todo.description && (
            <p
              className={`text-xs mt-1 line-clamp-2 ${
                isCompleted ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Metadata Row: Due Date, Tags, Subtasks counter */}
          <div className="flex items-center flex-wrap gap-3 mt-3 text-xs text-slate-400">
            {/* Due Date */}
            {todo.due_date && (
              <span
                className={`flex items-center space-x-1.5 font-medium ${
                  isOverdue
                    ? 'text-rose-300 font-semibold bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md'
                    : isCompleted
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due: '}
                  {todo.due_date}
                </span>
              </span>
            )}

            {/* Tags */}
            {todo.tags && todo.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {todo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks summary trigger */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 font-medium transition"
              >
                <span>
                  Subtasks: {completedSubtasks}/{totalSubtasks} ({subtaskProgress}%)
                </span>
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit, Delete, Expand Subtasks) */}
        <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded(!expanded)}
            title="Toggle subtask checklist"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(todo)}
            title="Edit task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            title="Delete task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Subtasks Checklist Section */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Checklist Subtasks
            </span>
            {totalSubtasks > 0 && (
              <span className="text-[11px] text-slate-500">
                {subtaskProgress}% completed
              </span>
            )}
          </div>

          {/* Subtask progress bar */}
          {totalSubtasks > 0 && (
            <div className="w-full bg-slate-800 rounded-full h-1 mb-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}

          {/* Existing Subtasks */}
          <div className="space-y-1.5 mb-3">
            {todo.subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-900/60 transition group/st"
              >
                <label className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={st.is_completed}
                    onChange={() => onToggleSubtask(todo.id, st.id, st.is_completed)}
                    className="w-3.5 h-3.5 rounded border-slate-600 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 cursor-pointer"
                  />
                  <span
                    className={`text-xs truncate ${
                      st.is_completed ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {st.title}
                  </span>
                </label>
                <button
                  onClick={() => onDeleteSubtask(todo.id, st.id)}
                  className="opacity-0 group-hover/st:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Remove subtask"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Inline Add Subtask Input */}
          <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim() || submittingSubtask}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
