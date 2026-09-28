import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  AlertCircle,
  Plus,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Todo } from '../types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  onEditTodo: (todo: Todo) => void;
  onAddSubtask: (todoId: number, title: string) => Promise<void>;
  onToggleSubtask: (todoId: number, subtaskId: number, currentCompleted: boolean) => Promise<void>;
  onDeleteSubtask: (todoId: number, subtaskId: number) => Promise<void>;
  onOpenNewTodo: () => void;
  onViewNotesForTodo?: (todoId: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onOpenNewTodo,
  onViewNotesForTodo,
}) => {
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Helper to determine if a task is overdue
  const isOverdue = (todo: Todo) =>
    Boolean(todo.due_date) &&
    todo.status !== 'completed' &&
    new Date(`${todo.due_date}T23:59:59`) < new Date();

  // Overdue count across all tasks
  const overdueCount = todos.filter(isOverdue).length;

  // Filter tasks based on onlyOverdue toggle
  const filteredTodos = onlyOverdue ? todos.filter(isOverdue) : todos;

  const activeTodos = filteredTodos.filter((t) => t.status !== 'completed');
  const completedTodos = filteredTodos.filter((t) => t.status === 'completed');

  if (todos.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <CheckSquare className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No tasks found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          You have no tasks matching the selected filters. Add a new task to stay organized and productive!
        </p>
        <button
          onClick={onOpenNewTodo}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Quick Filter Bar: All vs Overdue Only */}
      <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/80 rounded-2xl p-2 sm:px-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium hidden sm:inline">View:</span>
          <button
            onClick={() => setOnlyOverdue(false)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              !onlyOverdue
                ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Tasks ({todos.length})
          </button>

          {/* Quick-Filter Button for Overdue Tasks */}
          <button
            onClick={() => setOnlyOverdue(!onlyOverdue)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition border ${
              onlyOverdue
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/25'
                : overdueCount > 0
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyOverdue ? 'text-white' : 'text-rose-400'}`} />
            <span>Overdue Only</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                onlyOverdue
                  ? 'bg-white/25 text-white'
                  : overdueCount > 0
                  ? 'bg-rose-500/30 text-rose-200'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {overdueCount}
            </span>
          </button>
        </div>

        {/* Quick status text or indicator */}
        {overdueCount > 0 && !onlyOverdue && (
          <div
            onClick={() => setOnlyOverdue(true)}
            className="cursor-pointer text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>{overdueCount} task{overdueCount > 1 ? 's' : ''} past due</span>
          </div>
        )}

        {onlyOverdue && (
          <button
            onClick={() => setOnlyOverdue(false)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Show All Tasks
          </button>
        )}
      </div>

      {/* Empty State when Overdue Filter is Active and None Exist */}
      {onlyOverdue && activeTodos.length === 0 && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-8 text-center animate-in fade-in duration-200">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No overdue tasks!</h3>
          <p className="text-xs text-emerald-300/80 max-w-xs mx-auto mb-4">
            Great job! You have completed all past-due tasks or all deadlines are current.
          </p>
          <button
            onClick={() => setOnlyOverdue(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Show All Tasks
          </button>
        </div>
      )}

      {/* Active Tasks Section */}
      {activeTodos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span>{onlyOverdue ? 'Overdue Tasks' : 'Active Tasks'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                onlyOverdue
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'bg-slate-800 text-indigo-400'
              }`}>
                {activeTodos.length}
              </span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                onEdit={onEditTodo}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onViewNotesForTodo={onViewNotesForTodo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Section (Only show if not filtering only overdue) */}
      {!onlyOverdue && completedTodos.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <span>Completed</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 text-[10px]">
                {completedTodos.length}
              </span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                onEdit={onEditTodo}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onViewNotesForTodo={onViewNotesForTodo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
