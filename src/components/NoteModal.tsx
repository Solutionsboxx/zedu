import React, { useState, useEffect } from 'react';
import { X, Pin, FileText, Tag, Link2, Eye, Edit3 } from 'lucide-react';
import { Note, NoteColor, NoteCreateInput, NoteUpdateInput, Todo } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null; // null for create mode
  onSubmit: (data: NoteCreateInput | NoteUpdateInput) => Promise<void>;
  availableTodos: Todo[];
  availableTags: string[];
}

const colorOptions: { id: NoteColor; label: string; class: string }[] = [
  { id: 'default', label: 'Default', class: 'bg-slate-700 border-slate-500' },
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-600 border-indigo-400' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-600 border-amber-400' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600 border-emerald-400' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-600 border-rose-400' },
  { id: 'violet', label: 'Violet', class: 'bg-violet-600 border-violet-400' },
  { id: 'sky', label: 'Sky', class: 'bg-sky-600 border-sky-400' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onSubmit,
  availableTodos,
  availableTags,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>('default');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [todoId, setTodoId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setIsPinned(note.is_pinned);
      setColor(note.color);
      setTags(note.tags || []);
      setTodoId(note.todo_id);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setColor('default');
      setTags([]);
      setTodoId(null);
    }
    setPreviewMode(false);
    setError(null);
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd?: string) => {
    const raw = (tagToAdd || tagInput).trim();
    if (!raw) return;
    const cleanTag = raw.replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
        color,
        tags,
        todo_id: todoId,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              {note ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Pinned note' : 'Pin note to top'}
              className={`p-1.5 rounded-lg transition ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Note Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Decisions & Database Schema"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Color Palette & Linked Task Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Card Theme Color
              </label>
              <div className="flex items-center space-x-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setColor(opt.id)}
                    title={opt.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${opt.class} ${
                      color === opt.id
                        ? 'ring-2 ring-white scale-110 shadow-md'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Link to Todo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link to Task (Optional)
              </label>
              <div className="relative">
                <select
                  value={todoId === null ? '' : todoId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTodoId(val ? Number(val) : null);
                  }}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="" className="bg-slate-900">-- None (Standalone Note) --</option>
                  {availableTodos.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900">
                      Task: {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content with Edit / Preview Switch */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Note Content (Markdown supported)
              </label>
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    !previewMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    previewMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="w-full min-h-[160px] p-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {content ? content : <span className="italic text-slate-500">Nothing to preview</span>}
              </div>
            ) : (
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here... Markdown lists, code snippets, and checklists are supported."
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono leading-relaxed"
              />
            )}
          </div>

          {/* Tags Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                Add Tag
              </button>
            </div>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested Tags */}
            {availableTags.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Suggestions:</span>
                {availableTags
                  .filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                      +{t}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition"
            >
              {submitting ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
