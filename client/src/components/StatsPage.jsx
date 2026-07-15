import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Flame, Clock } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/learnings/stats');
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="text-center py-10 text-gray-500">Loading stats...</div>
  );

  if (!stats) return (
    <div className="text-center py-10 text-gray-500">Could not load stats.</div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Progress</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
          label="Total Topics"
          value={stats.totalTopics}
          color="bg-indigo-50 dark:bg-indigo-900/30"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-red-500" />}
          label="Due for Review"
          value={stats.dueToday}
          color="bg-red-50 dark:bg-red-900/30"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          label="Reviewed This Week"
          value={stats.reviewedThisWeek}
          color="bg-green-50 dark:bg-green-900/30"
        />
        <StatCard
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          label="Day Streak"
          value={stats.streak}
          color="bg-orange-50 dark:bg-orange-900/30"
        />
      </div>

      {stats.stageBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Topics by Stage</h3>
          <div className="space-y-3">
            {stats.stageBreakdown.map(({ _id: stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-16">Stage {stage}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${(count / stats.totalTopics) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
