/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Todo,
  Note,
  Stats,
  ViewTab,
  Priority,
  TodoCreateInput,
  TodoUpdateInput,
  NoteCreateInput,
  NoteUpdateInput,
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { QuickAddBar } from './components/QuickAddBar';
import { TodoList } from './components/TodoList';
import { TodoModal } from './components/TodoModal';
import { NoteGrid } from './components/NoteGrid';
import { NoteModal } from './components/NoteModal';
import { DocsModal } from './components/DocsModal';
import { OverviewView } from './components/OverviewView';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Main view navigation tab
  const [currentTab, setCurrentTab] = useState<ViewTab>('all');

  // Backend data
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [apiHealthy, setApiHealthy] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal controls
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Data fetching functions
  const loadData = useCallback(async () => {
    try {
      const [todosData, notesData, statsData, tagsData] = await Promise.all([
        api.getTodos({
          search: searchQuery,
          status: statusFilter,
          priority: priorityFilter,
          tag: selectedTag,
          sort_by: sortBy,
          order: sortOrder,
        }),
        api.getNotes({
          search: searchQuery,
          tag: selectedTag,
        }),
        api.getStats(),
        api.getTags(),
      ]);

      setTodos(todosData);
      setNotes(notesData);
      setStats(statsData);
      setAvailableTags(tagsData);
      setApiHealthy(true);
    } catch (err: any) {
      console.error('Failed to fetch from FastAPI backend:', err);
      setApiHealthy(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, selectedTag, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.getHealth();
        setApiHealthy(true);
      } catch {
        setApiHealthy(false);
      }
    };
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Todo Handlers
  const handleToggleTodo = async (id: number) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = t.status !== 'completed';
          return {
            ...t,
            status: nextCompleted ? 'completed' : 'todo',
            completed_at: nextCompleted ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );

    try {
      await api.toggleTodo(id);
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err) {
      showToast('Failed to toggle task status', 'error');
      loadData();
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const target = todos.find((t) => t.id === id);
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.deleteTodo(id);
      showToast(`Task "${target?.title || ''}" deleted`);
      const [updatedStats, updatedTags] = await Promise.all([api.getStats(), api.getTags()]);
      setStats(updatedStats);
      setAvailableTags(updatedTags);
    } catch (err) {
      showToast('Failed to delete task', 'error');
      loadData();
    }
  };

  const handleQuickAddTodo = async (data: {
    title: string;
    priority: Priority;
    due_date: string | null;
  }) => {
    try {
      const created = await api.createTodo(data);
      setTodos((prev) => [created, ...prev]);
      showToast('Task added successfully!');
      const [updatedStats, updatedTags] = await Promise.all([api.getStats(), api.getTags()]);
      setStats(updatedStats);
      setAvailableTags(updatedTags);
    } catch (err: any) {
      showToast(err?.message || 'Failed to add task', 'error');
      throw err;
    }
  };

  const handleSaveTodo = async (data: TodoCreateInput | TodoUpdateInput) => {
    if (editingTodo) {
      await api.updateTodo(editingTodo.id, data);
      showToast('Task updated successfully');
    } else {
      await api.createTodo(data as TodoCreateInput);
      showToast('New task created');
    }
    await loadData();
  };

  // Subtask Handlers
  const handleAddSubtask = async (todoId: number, title: string) => {
    try {
      const newSubtask = await api.addSubtask(todoId, title);
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t))
      );
    } catch (err) {
      showToast('Failed to add checklist item', 'error');
    }
  };

  const handleToggleSubtask = async (
    todoId: number,
    subtaskId: number,
    currentCompleted: boolean
  ) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, is_completed: !currentCompleted } : st
            ),
          };
        }
        return t;
      })
    );

    try {
      await api.updateSubtask(todoId, subtaskId, { is_completed: !currentCompleted });
    } catch (err) {
      showToast('Failed to update subtask', 'error');
      loadData();
    }
  };

  const handleDeleteSubtask = async (todoId: number, subtaskId: number) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
          };
        }
        return t;
      })
    );

    try {
      await api.deleteSubtask(todoId, subtaskId);
    } catch (err) {
      showToast('Failed to delete subtask', 'error');
      loadData();
    }
  };

  // Note Handlers
  const handleTogglePinNote = async (id: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
    );

    try {
      await api.togglePinNote(id);
      const updatedStats = await api.getStats();
      setStats(updatedStats);
    } catch (err) {
      showToast('Failed to toggle pinned status', 'error');
      loadData();
    }
  };

  const handleDeleteNote = async (id: number) => {
    const target = notes.find((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      await api.deleteNote(id);
      showToast(`Note "${target?.title || ''}" deleted`);
      const [updatedStats, updatedTags] = await Promise.all([api.getStats(), api.getTags()]);
      setStats(updatedStats);
      setAvailableTags(updatedTags);
    } catch (err) {
      showToast('Failed to delete note', 'error');
      loadData();
    }
  };

  const handleSaveNote = async (data: NoteCreateInput | NoteUpdateInput) => {
    if (editingNote) {
      await api.updateNote(editingNote.id, data);
      showToast('Note updated successfully');
    } else {
      await api.createNote(data as NoteCreateInput);
      showToast('New note created');
    }
    await loadData();
  };

  // Reset demo data handler
  const handleResetData = async () => {
    try {
      setLoading(true);
      await api.resetData();
      showToast('Database reset to fresh demo data!');
      await loadData();
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Jump from note to linked todo
  const handleViewLinkedTodo = (todoId: number) => {
    setCurrentTab('todos');
    const target = todos.find((t) => t.id === todoId);
    if (target) {
      setEditingTodo(target);
      setIsTodoModalOpen(true);
    }
  };

  // Filter notes linked to a todo
  const handleViewNotesForTodo = (todoId: number) => {
    setCurrentTab('notes');
    const target = todos.find((t) => t.id === todoId);
    if (target) {
      setSearchQuery(target.title);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        apiHealthy={apiHealthy}
        onResetData={handleResetData}
        onOpenDocs={() => setIsDocsModalOpen(true)}
        onOpenNewTodo={() => {
          setEditingTodo(null);
          setIsTodoModalOpen(true);
        }}
        onOpenNewNote={() => {
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Backend Warning Banner if offline */}
        {!apiHealthy && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">FastAPI backend starting or reconnecting...</p>
                <p className="text-xs text-amber-400/80">
                  SQLite database queries will automatically resume as soon as the service responds.
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/30 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Global Stats Cards */}
        <StatsCards
          stats={stats}
          onFilterStatus={(st) => {
            setCurrentTab('todos');
            setStatusFilter(st);
          }}
          onFilterPriority={(pr) => {
            setCurrentTab('todos');
            setPriorityFilter(pr);
          }}
          onFilterPinned={() => {
            setCurrentTab('notes');
          }}
        />

        {/* Filters & Search Toolbar (Except on Overview tab) */}
        {currentTab !== 'overview' && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderToggle={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            availableTags={availableTags}
            onOpenNewTodo={() => {
              setEditingTodo(null);
              setIsTodoModalOpen(true);
            }}
            onOpenNewNote={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
          />
        )}

        {/* Tab 1: All-in-One Split Workspace View */}
        {currentTab === 'all' && (
          <div className="space-y-6">
            <QuickAddBar onAddTodo={handleQuickAddTodo} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Tasks (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Task Backlog</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      {todos.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => {
                      setEditingTodo(null);
                      setIsTodoModalOpen(true);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Detailed Task
                  </button>
                </div>

                <TodoList
                  todos={todos}
                  onToggleTodo={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onEditTodo={(td) => {
                    setEditingTodo(td);
                    setIsTodoModalOpen(true);
                  }}
                  onAddSubtask={handleAddSubtask}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteSubtask={handleDeleteSubtask}
                  onOpenNewTodo={() => {
                    setEditingTodo(null);
                    setIsTodoModalOpen(true);
                  }}
                  onViewNotesForTodo={handleViewNotesForTodo}
                />
              </div>

              {/* Right Column: Notes (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Knowledge & Notes</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      {notes.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setIsNoteModalOpen(true);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    + New Note
                  </button>
                </div>

                <NoteGrid
                  notes={notes}
                  onTogglePin={handleTogglePinNote}
                  onDeleteNote={handleDeleteNote}
                  onEditNote={(nt) => {
                    setEditingNote(nt);
                    setIsNoteModalOpen(true);
                  }}
                  onOpenNewNote={() => {
                    setEditingNote(null);
                    setIsNoteModalOpen(true);
                  }}
                  onViewLinkedTodo={handleViewLinkedTodo}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dedicated Tasks View */}
        {currentTab === 'todos' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <QuickAddBar onAddTodo={handleQuickAddTodo} />
            <TodoList
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onEditTodo={(td) => {
                setEditingTodo(td);
                setIsTodoModalOpen(true);
              }}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onOpenNewTodo={() => {
                setEditingTodo(null);
                setIsTodoModalOpen(true);
              }}
              onViewNotesForTodo={handleViewNotesForTodo}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Notes View */}
        {currentTab === 'notes' && (
          <div>
            <NoteGrid
              notes={notes}
              onTogglePin={handleTogglePinNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={(nt) => {
                setEditingNote(nt);
                setIsNoteModalOpen(true);
              }}
              onOpenNewNote={() => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
              onViewLinkedTodo={handleViewLinkedTodo}
            />
          </div>
        )}

        {/* Tab 4: Overview / Insights */}
        {currentTab === 'overview' && (
          <OverviewView
            stats={stats}
            todos={todos}
            notes={notes}
            availableTags={availableTags}
            onOpenDocs={() => setIsDocsModalOpen(true)}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setCurrentTab('all');
            }}
            onSelectStatus={(st) => {
              setStatusFilter(st);
              setCurrentTab('todos');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        todo={editingTodo}
        onSubmit={handleSaveTodo}
        availableTags={availableTags}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={editingNote}
        onSubmit={handleSaveNote}
        availableTodos={todos}
        availableTags={availableTags}
      />

      <DocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
