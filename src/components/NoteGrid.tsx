import React from 'react';
import { Pin, FileText, Plus } from 'lucide-react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NoteGridProps {
  notes: Note[];
  onTogglePin: (id: number) => void;
  onDeleteNote: (id: number) => void;
  onEditNote: (note: Note) => void;
  onOpenNewNote: () => void;
  onViewLinkedTodo?: (todoId: number) => void;
}

export const NoteGrid: React.FC<NoteGridProps> = ({
  notes,
  onTogglePin,
  onDeleteNote,
  onEditNote,
  onOpenNewNote,
  onViewLinkedTodo,
}) => {
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const otherNotes = notes.filter((n) => !n.is_pinned);

  if (notes.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No notes found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          Capture thoughts, meeting notes, project specs, or link them directly to your tasks.
        </p>
        <button
          onClick={onOpenNewNote}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 px-1 text-xs font-bold uppercase tracking-wider text-amber-400/90">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>Pinned Notes ({pinnedNotes.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={onTogglePin}
                onDelete={onDeleteNote}
                onEdit={onEditNote}
                onViewLinkedTodo={onViewLinkedTodo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes Section */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center space-x-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400 pt-3 border-t border-slate-800">
              <FileText className="w-3.5 h-3.5" />
              <span>Other Notes ({otherNotes.length})</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={onTogglePin}
                onDelete={onDeleteNote}
                onEdit={onEditNote}
                onViewLinkedTodo={onViewLinkedTodo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
