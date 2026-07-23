import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Search, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import Button from './ui/Button.jsx';
import Badge from './ui/Badge.jsx';
import Card from './ui/Card.jsx';

const AllLearnings = ({ learnings, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState(null);

  // Scoped mutation states per pattern
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.three-dot-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueCycles = [...new Set(learnings.map((item) => item.stage))].sort((a, b) => a - b);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLearnings = learnings.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(normalizedQuery) ||
      (item.description && item.description.toLowerCase().includes(normalizedQuery));
    const matchesCycle =
      selectedCycle === 'all' || item.stage.toString() === selectedCycle.toString();
    return matchesSearch && matchesCycle;
  });

  const handleEditStart = (item) => {
    setError(null);
    setOpenMenuId(null);
    setEditingId(item._id);
    setEditTopic(item.topic);
    setEditDescription(item.description || '');
  };

  const handleEditSave = async (id) => {
    setError(null);
    setUpdatingId(id);
    try {
      await api.put(`/learnings/${id}`, { topic: editTopic, description: editDescription });
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update pattern. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    setOpenMenuId(null);
    if (!window.confirm('Are you sure you want to delete this pattern?')) return;
    setError(null);
    setDeletingId(id);
    try {
      await api.delete(`/learnings/${id}`);
      onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete pattern. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Library Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-slate-300">
            {learnings.length} {learnings.length === 1 ? 'pattern' : 'patterns'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#1E293B] border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Cycle Filter */}
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-slate-700/80 text-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="all">All Cycles</option>
            {uniqueCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                Cycle {cycle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Mutation Error Banner */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 3. True Empty Library State */}
      {learnings.length === 0 && (
        <Card className="p-10 text-center border-slate-700/80 shadow-md my-8">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              No patterns captured yet.
            </h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Capture your first learning pattern to start building your review schedule.
            </p>
          </div>
        </Card>
      )}

      {/* 4. Filtered Zero-Results State */}
      {learnings.length > 0 && filteredLearnings.length === 0 && (
        <Card className="p-10 text-center border-slate-700/80 shadow-md my-8">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">
              No patterns match your filters.
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              Try a different search or cycle.
            </p>
            <div className="pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCycle('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 5. Pattern List (Independent Compact Rows with modest vertical spacing) */}
      {filteredLearnings.length > 0 && (
        <div className="space-y-3.5">
          {filteredLearnings.map((item) => (
            <div
              key={item._id}
              className="bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 sm:p-5 shadow-sm transition-all hover:border-slate-600"
            >
              {editingId === item._id ? (
                /* Inline Editing State */
                <div className="space-y-3 bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/80">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Topic</label>
                    <input
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-[#0F172A] text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Description</label>
                    <textarea
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-[#0F172A] text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 transition-all"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      disabled={updatingId === item._id}
                      onClick={() => handleEditSave(item._id)}
                      className="!py-1.5 !px-4 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{updatingId === item._id ? 'Saving...' : 'Save'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={updatingId === item._id}
                      onClick={() => setEditingId(null)}
                      className="!py-1.5 !px-4 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Compact Pattern Row Display */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left / Primary Content */}
                  <div className="min-w-0 flex-1 sm:mr-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
                      {item.topic}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No takeaway note provided.'}
                    </p>
                    <div className="mt-2.5">
                      <Badge variant="indigo" className="text-[11px] font-bold py-0.5 px-2.5">
                        Cycle {item.stage}
                      </Badge>
                    </div>
                  </div>

                  {/* Right / Schedule & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0">
                    {/* Next Review Schedule Block */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 text-right">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Next review
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-300">
                        {format(new Date(item.nextReviewDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Three-Dot Action Menu */}
                    <div className="relative three-dot-menu-container">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                        disabled={deletingId === item._id}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {/* Anchored Dropdown Menu */}
                      {openMenuId === item._id && (
                        <div className="absolute right-0 mt-2 w-36 bg-[#1E293B] border border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => handleEditStart(item)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Library Footer Message */}
      {filteredLearnings.length > 0 && (
        <p className="text-center text-xs text-slate-500 font-medium pt-4 pb-8">
          That's all your patterns! 💜
        </p>
      )}
    </div>
  );
};

export default AllLearnings;
