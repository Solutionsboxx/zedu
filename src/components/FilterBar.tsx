import React from 'react';
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  Tag as TagIcon,
  Plus,
  FilePlus,
  SlidersHorizontal,
} from 'lucide-react';
import { Priority, TodoStatus } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  availableTags: string[];
  onOpenNewTodo: () => void;
  onOpenNewNote: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  selectedTag,
  onTagChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  availableTags,
  onOpenNewTodo,
  onOpenNewNote,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    selectedTag !== 'all';

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onPriorityFilterChange('all');
    onTagChange('all');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
      {/* Top row: Search input + Primary action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, notes, content, or tags..."
            className="w-full pl-10 pr-9 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTodo}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={onOpenNewNote}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-sm font-medium border border-slate-700 transition active:scale-95"
          >
            <FilePlus className="w-4 h-4 text-indigo-400" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filters, Status Chips, Tags, Sorting */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
        {/* Status Pills */}
        <div className="flex items-center bg-slate-800/70 p-1 rounded-xl border border-slate-700/50">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Done' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onStatusFilterChange(item.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                statusFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-1 bg-slate-800/70 px-2 py-1 rounded-xl border border-slate-700/50">
          <span className="text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" className="bg-slate-800">All</option>
            <option value="urgent" className="bg-slate-800 text-rose-400">Urgent</option>
            <option value="high" className="bg-slate-800 text-amber-400">High</option>
            <option value="medium" className="bg-slate-800 text-blue-400">Medium</option>
            <option value="low" className="bg-slate-800 text-slate-400">Low</option>
          </select>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="flex items-center space-x-1 bg-slate-800/70 px-2 py-1 rounded-xl border border-slate-700/50">
            <TagIcon className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">Tag:</span>
            <select
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[120px] truncate"
            >
              <option value="all" className="bg-slate-800">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag} className="bg-slate-800">
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Filter */}
        <div className="flex items-center space-x-1 bg-slate-800/70 px-2 py-1 rounded-xl border border-slate-700/50 ml-auto">
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="created_at" className="bg-slate-800">Date Created</option>
            <option value="due_date" className="bg-slate-800">Due Date</option>
            <option value="priority" className="bg-slate-800">Priority Level</option>
            <option value="title" className="bg-slate-800">Alphabetical</option>
          </select>

          <button
            onClick={onSortOrderToggle}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            className="p-0.5 rounded text-slate-400 hover:text-white"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
          >
            <X className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
