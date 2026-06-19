import { BookOpen } from 'lucide-react';

const Header = ({ view, setView }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
          <BookOpen className="w-8 h-8" /> Pattern Retainer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Spaced repetition learning logger</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {['dashboard', 'calendar', 'all', 'stats'].map((v) => {
            const VIEW_LABELS = {
              dashboard: 'Dashboard',
              calendar: 'Calendar',
              all: 'All',
              stats: 'Stats',
            };
            return (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  view === v 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            );
          })}
        </div>


      </div>
    </header>
  );
};

export default Header;