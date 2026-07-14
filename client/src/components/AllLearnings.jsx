import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import api from '../api/axios';

const AllLearnings = ({ learnings, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState(null);

  const handleEditStart = (item) => {
    setError(null);
    setEditingId(item._id);
    setEditTopic(item.topic);
    setEditDescription(item.description);
  };

  const handleEditSave = async (id) => {
    setError(null);
    try {
      await api.put(`/learnings/${id}`, { topic: editTopic, description: editDescription });
      setEditingId(null);
      onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update learning. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    setError(null);
    try {
      await api.delete(`/learnings/${id}`);
      onUpdate();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete learning. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">All Learnings ({learnings.length})</h2>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      {learnings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Nothing logged yet. Add your first learning!</p>
        </div>
      )}
      {learnings.map((item) => (
        <div key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {editingId === item._id ? (
            <div className="space-y-2">
              <input
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
              />
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none resize-none h-20"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => handleEditSave(item._id)} className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer">
                  <Check className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditingId(null)} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Stage {item.stage}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{item.topic}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEditStart(item)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllLearnings;
