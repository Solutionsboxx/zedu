import React from 'react';
import {
  CheckSquare,
  FileText,
  LayoutGrid,
  BarChart3,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Server,
} from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  apiHealthy: boolean;
  onResetData: () => void;
  onOpenDocs: () => void;
  onOpenNewTodo: () => void;
  onOpenNewNote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  apiHealthy,
  onResetData,
  onOpenDocs,
  onOpenNewTodo,
  onOpenNewNote,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">TaskFlow</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FastAPI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Python ASGI Backend &bull; SQLite Persistence &bull; Modern React
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onTabChange('all')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Workspace</span>
            </button>
            <button
              onClick={() => onTabChange('todos')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'todos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => onTabChange('notes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => onTabChange('overview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Insights</span>
            </button>
          </nav>

          {/* Quick Action Tools & Docs */}
          <div className="flex items-center space-x-2">
            {/* FastAPI Docs button */}
            <button
              onClick={onOpenDocs}
              title="Inspect live FastAPI OpenAPI Swagger documentation"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Swagger /docs</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={onResetData}
              title="Reset sample tasks and notes from Python backend"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Quick Add Buttons */}
            <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-800">
              <button
                onClick={onOpenNewTodo}
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                <span>+ Task</span>
              </button>
              <button
                onClick={onOpenNewNote}
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <span>+ Note</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
