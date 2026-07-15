import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import Dashboard from './DashBoard.jsx'; 
import CalendarView from './CalendarView.jsx';
import AllLearnings from './AllLearnings.jsx';
import StatsPage from './StatsPage.jsx';
import AppShell from './layout/AppShell.jsx';
import CapturePatternModal from './CapturePatternModal.jsx';

const MainLayout = ({ user, onLogout }) => {
  const [learnings, setLearnings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const fetchLearnings = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get('/learnings');
      setLearnings(data);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to fetch learnings", error);
      setFetchError('Could not load your learnings. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => { 
    if (user) {
      fetchLearnings(); 
    }
  }, [user, fetchLearnings]);

  return (
    <>
      <AppShell
        view={view}
        setView={setView}
        user={user}
        onLogout={onLogout}
        onOpenCaptureModal={() => setIsCaptureModalOpen(true)}
        refreshTrigger={refreshTrigger}
      >
        {/* Reliability & View State Rendering */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#1E293B] rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Loading patterns and schedule...</p>
          </div>
        ) : fetchError && view !== 'stats' ? (
          <div className="bg-[#1E293B] rounded-2xl p-10 text-center shadow-sm border border-slate-700/60 max-w-xl mx-auto my-10">
            <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              !
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Connection Problem</h3>
            <p className="text-red-300/90 font-medium mb-6 text-sm">{fetchError}</p>
            <button
              onClick={fetchLearnings}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md text-sm"
            >
              Retry
            </button>
          </div>
        ) : view === 'dashboard' ? (
          <Dashboard learnings={learnings} onReview={fetchLearnings} />
        ) : view === 'stats' ? (
          <StatsPage />
        ) : view === 'all' ? (
          <AllLearnings learnings={learnings} onUpdate={fetchLearnings} />
        ) : (
          <CalendarView learnings={learnings} />
        )}
      </AppShell>

      {/* Capture Pattern Modal */}
      <CapturePatternModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onAddSuccess={fetchLearnings}
      />
    </>
  );
};

export default MainLayout;
