import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/axios';

const Dashboard = ({ learnings, onReview }) => {
  const dueItems = learnings.filter(l => new Date(l.nextReviewDate) <= new Date());

  const handleReview = async (id) => {
    await api.put(`/learnings/${id}/review`);
    onReview();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Due for Review Today</h2>
      
      <div className="space-y-4">
        {dueItems.map((item) => (
          <div key={item._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-red-500 dark:border-red-500 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-bold text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30 rounded-full mb-2">
                  Stage {item.stage}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.topic}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
              </div>
              <button 
                onClick={() => handleReview(item._id)}
                className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-medium text-sm transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> <span className="hidden sm:inline">Mark Reviewed</span>
              </button>
            </div>
          </div>
        ))}
        
        {dueItems.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400">No reviews due today! Great job.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;