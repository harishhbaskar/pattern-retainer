import { useState, useEffect } from 'react';
import { BookOpen, Home, Calendar, BarChart3, Flame } from 'lucide-react';
import api from '../../api/axios';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Today', icon: Home },
  { id: 'calendar', label: 'Schedule', icon: Calendar },
  { id: 'all', label: 'Library', icon: BookOpen },
  { id: 'stats', label: 'Progress', icon: BarChart3 },
];

const Sidebar = ({ view, setView, refreshTrigger = 0 }) => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStreak = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await api.get('/learnings/stats');
        if (isMounted) {
          setStreak(data?.streak ?? 0);
        }
      } catch (err) {
        console.error('Failed to fetch streak in sidebar', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStreak();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  return (
    <aside className="w-full md:w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between p-4 md:p-6 flex-shrink-0 min-h-[auto] md:min-h-screen">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">Pattern Retainer</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Spaced Repetition</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-bold border-l-4 border-indigo-500 rounded-r-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Streak Card */}
      <div className="mt-8 bg-[#1E293B] border border-slate-700/60 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Keep the streak alive! 🔥</span>
          <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
        </div>

        <div className="flex items-baseline gap-2 my-2">
          {loading ? (
            <span className="text-2xl font-bold text-slate-400 animate-pulse">--</span>
          ) : error ? (
            <span className="text-2xl font-bold text-slate-500">--</span>
          ) : (
            <span className="text-3xl font-extrabold text-white tracking-tight">{streak}</span>
          )}
          <span className="text-xs font-medium text-slate-400">Day streak</span>
        </div>

        {/* Decorative 7-day neutral visual indicator (do not imply historical review-day data) */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className="w-2.5 h-2.5 rounded-full bg-slate-700/80 border border-slate-600/60"
              title="Seven-day visual indicator"
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
