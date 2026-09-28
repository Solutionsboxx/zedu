import React from 'react';
import { Pin, Trash2, Edit2, Link2, Calendar } from 'lucide-react';
import { Note, NoteColor } from '../types';

interface NoteCardProps {
  note: Note;
  onTogglePin: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (note: Note) => void;
  onViewLinkedTodo?: (todoId: number) => void;
}

const colorStyles: Record<
  NoteColor,
  { bg: string; border: string; accent: string; badge: string }
> = {
  default: {
    bg: 'bg-slate-900/80',
    border: 'border-slate-800 hover:border-slate-700',
    accent: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-300 border-slate-700/60',
  },
  amber: {
    bg: 'bg-amber-950/20 hover:bg-amber-950/30',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  emerald: {
    bg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  indigo: {
    bg: 'bg-indigo-950/20 hover:bg-indigo-950/30',
    border: 'border-indigo-500/30 hover:border-indigo-500/50',
    accent: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  rose: {
    bg: 'bg-rose-950/20 hover:bg-rose-950/30',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    accent: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  violet: {
    bg: 'bg-violet-950/20 hover:bg-violet-950/30',
    border: 'border-violet-500/30 hover:border-violet-500/50',
    accent: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  sky: {
    bg: 'bg-sky-950/20 hover:bg-sky-950/30',
    border: 'border-sky-500/30 hover:border-sky-500/50',
    accent: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onTogglePin,
  onDelete,
  onEdit,
  onViewLinkedTodo,
}) => {
  const theme = colorStyles[note.color] || colorStyles.default;

  return (
    <div
      className={`group relative rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${theme.bg} ${theme.border}`}
    >
      <div>
        {/* Top Header: Pin button & Title */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            onClick={() => onEdit(note)}
            className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-2"
          >
            {note.title}
          </h3>

          <button
            onClick={() => onTogglePin(note.id)}
            title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
            className={`p-1.5 rounded-lg transition-all ${
              note.is_pinned
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 opacity-60 group-hover:opacity-100'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content Preview */}
        <div
          onClick={() => onEdit(note)}
          className="text-xs text-slate-300/90 whitespace-pre-wrap line-clamp-6 mb-4 font-normal cursor-pointer leading-relaxed"
        >
          {note.content || <span className="italic text-slate-500">Empty note</span>}
        </div>
      </div>

      <div>
        {/* Linked Todo Pill */}
        {note.todo_id && (
          <div className="mb-3">
            <button
              onClick={() => onViewLinkedTodo && onViewLinkedTodo(note.todo_id!)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/50 transition max-w-full truncate"
              title={`Linked Task: ${note.todo_title || 'Task'}`}
            >
              <Link2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span className="truncate">Task: {note.todo_title || `#${note.todo_id}`}</span>
            </button>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${theme.badge}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Date & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          <span className="truncate">
            {new Date(note.updated_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>

          <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              title="Delete note"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
