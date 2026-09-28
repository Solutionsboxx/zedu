import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Pin, Zap } from 'lucide-react';
import { Stats } from '../types';

interface StatsCardsProps {
  stats: Stats | null;
  onFilterStatus?: (status: string) => void;
  onFilterPriority?: (priority: string) => void;
  onFilterPinned?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  onFilterStatus,
  onFilterPriority,
  onFilterPinned,
}) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Task Completion Card */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('completed')}
        className="cursor-pointer group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Completion Rate</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.completion_rate}%</span>
              <span className="text-xs text-slate-400">
                ({stats.completed_todos}/{stats.total_todos})
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completion_rate}%` }}
          />
        </div>
      </div>

      {/* Pending Tasks Card */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('todo')}
        className="cursor-pointer group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Pending Tasks</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.pending_todos}</span>
              <span className="text-xs text-amber-400/90 font-medium">To accomplish</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 truncate">
          Click to view incomplete items
        </p>
      </div>

      {/* High Priority Card */}
      <div
        onClick={() => onFilterPriority && onFilterPriority('high')}
        className="cursor-pointer group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Urgent & High Priority</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.high_priority_todos}</span>
              <span className="text-xs text-rose-400/90 font-medium">Attention needed</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 truncate">
          Immediate action recommended
        </p>
      </div>

      {/* Notes Card */}
      <div
        onClick={() => onFilterPinned && onFilterPinned()}
        className="cursor-pointer group relative overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Knowledge Notes</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.total_notes}</span>
              <span className="text-xs text-indigo-400/90 font-medium">
                ({stats.pinned_notes} pinned)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Pin className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 truncate">
          Ideas, checklists & attachments
        </p>
      </div>
    </div>
  );
};
