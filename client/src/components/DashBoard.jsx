import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Flame, BookOpen, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { format, endOfDay } from 'date-fns';
import api from '../api/axios';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import Badge from './ui/Badge.jsx';

const Dashboard = ({ learnings, onReview, user }) => {
  const [error, setError] = useState(null);
  const [isReviewingId, setIsReviewingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local stats state for summary cards
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(false);
    try {
      const { data } = await api.get('/learnings/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Determine time-aware greeting
  const getGreetingText = () => {
    const hour = new Date().getHours();
    let prefix = 'Good evening';
    if (hour < 12) {
      prefix = 'Good morning';
    } else if (hour < 18) {
      prefix = 'Good afternoon';
    }

    if (user && user.name && typeof user.name === 'string') {
      const firstName = user.name.trim().split(/\s+/)[0];
      return `${prefix}, ${firstName}! 👋`;
    }
    return `${prefix}! 👋`;
  };

  // Due items rule: nextReviewDate <= end of today, sorted ascending
  const endOfToday = endOfDay(new Date());
  const dueItems = learnings
    .filter((l) => new Date(l.nextReviewDate) <= endOfToday)
    .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

  // Upcoming items rule: nextReviewDate > end of today, sorted ascending, up to 5
  const upcomingItems = learnings
    .filter((l) => new Date(l.nextReviewDate) > endOfToday)
    .sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
    .slice(0, 5);

  const currentDue = dueItems.length > 0 ? dueItems[0] : null;

  const handleReview = async (id, difficulty) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.put(`/learnings/${id}/review`, { difficulty });
      setIsReviewingId(null);
      if (onReview) {
        onReview();
      }
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to review learning. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Relative date calculation normalized to local start-of-day
  const getRelativeDateLabel = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays > 1) {
      return `In ${diffDays} days`;
    }
    return 'Tomorrow';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Personalized Greeting Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          {getGreetingText()}
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-1 font-medium">
          Let&apos;s make it stick.
        </p>
      </div>

      {/* Global Review Mutation Error Banner */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Due Review Hero Section */}
      {currentDue ? (
        <div className="bg-[#1E293B] border-2 border-indigo-500/60 shadow-xl rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all">
          {/* Top Hero Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Badge variant="indigo" className="uppercase tracking-wider font-extrabold text-[11px] px-3 py-1">
              Due For Review
            </Badge>
            <span className="text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full">
              {dueItems.length === 1 ? '1 due now' : `1 of ${dueItems.length} due`}
            </span>
          </div>

          {/* Pattern Details */}
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              {currentDue.topic}
            </h3>
            {currentDue.description && (
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
                {currentDue.description}
              </p>
            )}
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-indigo-300 border border-slate-700">
                Cycle {currentDue.stage}
              </span>
            </div>
          </div>

          {/* Review Interaction Area */}
          <div className="pt-4 border-t border-slate-700/60">
            {isReviewingId !== currentDue._id ? (
              <Button
                variant="primary"
                onClick={() => setIsReviewingId(currentDue._id)}
                className="!py-2.5 !px-6 text-sm md:text-base shadow-lg"
              >
                <span>Start Review</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  How did this feel?
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => handleReview(currentDue._id, 'hard')}
                    className="flex-1 sm:flex-none min-w-[110px]"
                  >
                    Hard
                  </Button>
                  <Button
                    variant="primary"
                    disabled={isSubmitting}
                    onClick={() => handleReview(currentDue._id, 'good')}
                    className="flex-1 sm:flex-none min-w-[110px]"
                  >
                    Good
                  </Button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReview(currentDue._id, 'easy')}
                    className="flex-1 sm:flex-none min-w-[110px] inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm"
                  >
                    Easy
                  </button>
                  <Button
                    variant="ghost"
                    disabled={isSubmitting}
                    onClick={() => setIsReviewingId(null)}
                    className="text-xs text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No-Due Hero State */
        <Card className="p-8 md:p-10 text-center border-slate-700/80 shadow-md">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
              You&apos;re all caught up! ✨
            </h3>
            <p className="text-sm text-slate-400 font-medium">
              No reviews due right now.
            </p>
            {upcomingItems.length > 0 && (
              <div className="pt-4 mt-2 border-t border-slate-800/80">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Next review
                </p>
                <p className="text-sm font-bold text-indigo-300">
                  {upcomingItems[0].topic}{' '}
                  <span className="text-slate-400 font-normal">
                    • {format(new Date(upcomingItems[0].nextReviewDate), 'MMM d')}
                  </span>
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 3. Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Day Streak */}
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-950/60 text-amber-500 border border-amber-800/50 flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-400 mb-0.5">Day streak</p>
            {statsLoading ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500 animate-pulse">--</p>
            ) : statsError ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500">--</p>
            ) : (
              <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats?.streak ?? 0}
              </p>
            )}
          </div>
        </Card>

        {/* Reviewed This Week */}
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-400 mb-0.5">Reviewed this week</p>
            {statsLoading ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500 animate-pulse">--</p>
            ) : statsError ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500">--</p>
            ) : (
              <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats?.reviewedThisWeek ?? 0}
              </p>
            )}
          </div>
        </Card>

        {/* Total Patterns */}
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-slate-400 mb-0.5">Total patterns</p>
            {statsLoading ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500 animate-pulse">--</p>
            ) : statsError ? (
              <p className="text-2xl md:text-3xl font-extrabold text-slate-500">--</p>
            ) : (
              <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {stats?.totalTopics ?? 0}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Coming Up Section */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">
          Coming Up
        </h2>

        {upcomingItems.length === 0 ? (
          <div className="bg-[#1E293B]/60 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-sm text-slate-400 font-medium">No upcoming reviews scheduled.</p>
          </div>
        ) : (
          <Card className="divide-y divide-slate-800/80 overflow-hidden">
            {upcomingItems.map((item) => (
              <div
                key={item._id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/60 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-200 text-sm truncate">{item.topic}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Cycle {item.stage} • {getRelativeDateLabel(item.nextReviewDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs md:text-sm font-semibold text-slate-300">
                    {format(new Date(item.nextReviewDate), 'MMM d')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;