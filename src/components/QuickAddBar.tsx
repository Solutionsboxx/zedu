import React, { useState } from 'react';
import { Plus, Calendar, Flag, Sparkles } from 'lucide-react';
import { Priority } from '../types';

interface QuickAddBarProps {
  onAddTodo: (data: { title: string; priority: Priority; due_date: string | null }) => Promise<void>;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    try {
      setLoading(true);
      await onAddTodo({
        title: title.trim(),
        priority,
        due_date: dueDate ? dueDate : null,
      });
      setTitle('');
      setDueDate('');
      setPriority('medium');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-6 shadow-sm focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Title Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quickly add a task (e.g., 'Finish monthly report'). Press Enter..."
            className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Priority & Date Selector Controls */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
          {/* Priority dropdown */}
          <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <Flag
              className={`w-3.5 h-3.5 ${
                priority === 'urgent'
                  ? 'text-rose-400'
                  : priority === 'high'
                  ? 'text-amber-400'
                  : priority === 'medium'
                  ? 'text-blue-400'
                  : 'text-slate-400'
              }`}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="urgent" className="bg-slate-800 text-rose-400">Urgent</option>
              <option value="high" className="bg-slate-800 text-amber-400">High</option>
              <option value="medium" className="bg-slate-800 text-blue-400">Medium</option>
              <option value="low" className="bg-slate-800 text-slate-400">Low</option>
            </select>
          </div>

          {/* Due date picker */}
          <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add</span>
          </button>
        </div>
      </div>
    </form>
  );
};
