import { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';



const LearningForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({ topic: '', description: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic) return;
    setError(null);

    try {
      await api.post('/learnings', formData);
      setFormData({ topic: '', description: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onAdd();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add learning. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Log New Learning
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g. React Hooks" 
            value={formData.topic}
            onChange={(e) => setFormData({...formData, topic: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Takeaway</label>
          <textarea 
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="What did you learn?" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg text-sm font-medium text-center">
            ✓ Added to your schedule!
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md cursor-pointer">
          Add to Schedule
        </button>
      </form>
    </div>
  );
};

export default LearningForm;