import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Tag,
  Server,
  Zap,
  ArrowRight,
  Database,
  Cpu,
} from 'lucide-react';
import { Stats, Todo, Note } from '../types';

interface OverviewViewProps {
  stats: Stats | null;
  todos: Todo[];
  notes: Note[];
  availableTags: string[];
  onOpenDocs: () => void;
  onSelectTag: (tag: string) => void;
  onSelectStatus: (status: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  todos,
  notes,
  availableTags,
  onOpenDocs,
  onSelectTag,
  onSelectStatus,
}) => {
  if (!stats) return null;

  const urgentCount = todos.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;
  const highCount = todos.filter((t) => t.priority === 'high' && t.status !== 'completed').length;
  const mediumCount = todos.filter((t) => t.priority === 'medium' && t.status !== 'completed').length;
  const lowCount = todos.filter((t) => t.priority === 'low' && t.status !== 'completed').length;

  const inProgressCount = todos.filter((t) => t.status === 'in_progress').length;
  const todoCount = todos.filter((t) => t.status === 'todo').length;
  const completedCount = stats.completed_todos;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Productivity Analytics & Architecture</span>
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Workspace Health & Velocity
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            FastAPI provides real-time transaction processing with SQLite. Track your completion rate, prioritize urgent tasks, and explore interconnected notes.
          </p>
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={onOpenDocs}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Server className="w-4 h-4" />
              <span>Explore FastAPI Swagger Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Priority Distribution & Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Active Tasks by Priority</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Urgent</span>
                <span className="text-slate-400">{urgentCount} tasks</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending_todos ? (urgentCount / stats.pending_todos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">High Priority</span>
                <span className="text-slate-400">{highCount} tasks</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending_todos ? (highCount / stats.pending_todos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-semibold">Medium Priority</span>
                <span className="text-slate-400">{mediumCount} tasks</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending_todos ? (mediumCount / stats.pending_todos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">Low Priority</span>
                <span className="text-slate-400">{lowCount} tasks</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.pending_todos ? (lowCount / stats.pending_todos) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Workflow Status Breakdown</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center mb-6">
            <div
              onClick={() => onSelectStatus('todo')}
              className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition"
            >
              <span className="text-2xl font-bold text-amber-400">{todoCount}</span>
              <p className="text-[11px] text-slate-400 mt-1">To Do</p>
            </div>
            <div
              onClick={() => onSelectStatus('in_progress')}
              className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition"
            >
              <span className="text-2xl font-bold text-indigo-400">{inProgressCount}</span>
              <p className="text-[11px] text-slate-400 mt-1">In Progress</p>
            </div>
            <div
              onClick={() => onSelectStatus('completed')}
              className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 cursor-pointer transition"
            >
              <span className="text-2xl font-bold text-emerald-400">{completedCount}</span>
              <p className="text-[11px] text-slate-400 mt-1">Completed</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Completion Velocity:</span>
            <span className="font-bold text-emerald-400">{stats.completion_rate}% Completed</span>
          </div>
        </div>
      </div>

      {/* Backend Specs & Tag Cloud */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tag Cloud */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Workspace Tag Distribution ({availableTags.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Click any tag to filter both tasks and notes simultaneously across your workspace:
          </p>

          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                #{tag}
              </button>
            ))}
            {availableTags.length === 0 && (
              <p className="text-xs italic text-slate-500">No tags created yet.</p>
            )}
          </div>
        </div>

        {/* Python FastAPI Architecture Info */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>System Stack & Architecture</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <span className="text-slate-400">API Framework:</span>
              <span className="font-semibold text-emerald-400">FastAPI 0.115+ (Python 3.10)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <span className="text-slate-400">ASGI Server:</span>
              <span className="font-semibold text-indigo-400">Uvicorn with Auto-Reload</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <span className="text-slate-400">Data Storage:</span>
              <span className="font-semibold text-purple-400">SQLite (WAL Mode, Foreign Key Cascades)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60">
              <span className="text-slate-400">Agent Specification:</span>
              <span className="font-semibold text-amber-400">Documented in AGENTS.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
