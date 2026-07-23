import { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../api/axios';

const LearningForm = ({ onAdd, isModal = false }) => {
  const [formData, setFormData] = useState({ topic: '', description: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.topic.trim()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post('/learnings', formData);
      setFormData({ topic: '', description: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onAdd) {
        onAdd();
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add learning. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? 'bg-transparent p-0' : 'bg-[#1E293B] rounded-xl shadow-sm border border-slate-700/60 p-6 sticky top-8 transition-colors'}>
      {!isModal && (
        <h2 className="text-lg font-semibold mb-4 text-slate-100 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" /> Log New Learning
        </h2>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5">Topic</label>
          <input
            type="text"
            required
            className="w-full px-3.5 py-2 rounded-lg border border-slate-700/80 bg-[#0F172A] text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-500 text-sm"
            placeholder="e.g. React Server Components"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5">Key Takeaway & Description</label>
          <textarea
            className="w-full px-3.5 py-2 rounded-lg border border-slate-700/80 bg-[#0F172A] text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder-slate-500 text-sm"
            placeholder="What pattern or takeaway did you learn?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        {success && (
          <div className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 p-3 rounded-lg text-sm font-medium text-center">
            ✓ Added to your schedule!
          </div>
        )}
        {error && (
          <div className="bg-red-950/60 text-red-300 border border-red-800/60 p-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !formData.topic.trim()}
          className="w-full bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors shadow-md cursor-pointer text-sm"
        >
          {isSubmitting ? 'Adding...' : 'Add to Schedule'}
        </button>
      </form>
    </div>
  );
};

export default LearningForm;