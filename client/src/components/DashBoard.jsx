import { useState } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { format, endOfDay } from 'date-fns';
import api from '../api/axios';

const Dashboard = ({ learnings, onReview }) => {
  const [error, setError] = useState(null);
  const endOfToday = endOfDay(new Date());
  const dueItems = learnings.filter(l => new Date(l.nextReviewDate) <= endOfToday);

  const upcomingItems = learnings
    .filter(l => new Date(l.nextReviewDate) > endOfToday)
    .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
    .slice(0, 5);

  const handleReview = async (id, difficulty) => {
    setError(null);
    try {
      await api.put(`/learnings/${id}/review`, { difficulty });
      onReview();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to review learning. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    setError(null);
    try {
      await api.delete(`/learnings/${id}`);
      onReview();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete learning. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Due for Review</h2>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {dueItems.map((item) => (
          <div key={item._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <span className="inline-block px-2 py-1 text-xs font-bold text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30 rounded-full mb-2">
                  Stage {item.stage}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.topic}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              </div>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleReview(item._id, 'hard')} className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 transition-colors cursor-pointer">Hard</button>
              <button onClick={() => handleReview(item._id, 'good')} className="flex-1 py-2 rounded-lg text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer">Good</button>
              <button onClick={() => handleReview(item._id, 'easy')} className="flex-1 py-2 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 transition-colors cursor-pointer">Easy</button>
            </div>
          </div>
        ))}
        
        {dueItems.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No reviews due today!</p>
            {upcomingItems.length > 0 ? (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Next up: <span className="font-bold text-indigo-600 dark:text-indigo-400">{upcomingItems[0].topic}</span>
                {' '}on{' '}
                <span className="font-medium">{format(new Date(upcomingItems[0].nextReviewDate), 'MMM d')}</span>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Add something new to get started.
              </p>
            )}
          </div>
        )}
      </div>

      {upcomingItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Coming Up</h2>
          <div className="space-y-3">
            {upcomingItems.map((item) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mr-2">
                    Stage {item.stage}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.topic}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(item.nextReviewDate), 'MMM d')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;