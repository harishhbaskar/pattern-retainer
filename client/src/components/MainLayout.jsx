import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import Header from './Header.jsx';
import LearningForm from './LearningForm.jsx';
import Dashboard from './DashBoard.jsx'; 
import CalendarView from './CalendarView.jsx';
import AllLearnings from './AllLearnings.jsx';
import StatsPage from './StatsPage.jsx';

const MainLayout = ({ user, onLogout }) => {
  const [learnings, setLearnings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const fetchLearnings = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      
      const { data } = await api.get('/learnings');
      setLearnings(data);
    } catch (error) {
      console.error("Failed to fetch learnings", error);
      setFetchError('Could not load your learnings. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { 
    if(user) fetchLearnings(); 
  }, [user]);

  
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
           <div className="text-sm text-gray-500">Welcome, <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.name}</span></div>
           <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer">Logout</button>
        </div>
        
        <Header 
          view={view} 
          setView={setView} 
        /> 

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LearningForm onAdd={fetchLearnings} />
          </div>
          <div className="lg:col-span-2">
            {isLoading ? (
               <div className="text-center py-10 text-gray-500">Loading patterns...</div>
            ) : fetchError && view !== 'stats' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-red-600 dark:text-red-400 font-medium mb-4">{fetchError}</p>
                <button
                  onClick={fetchLearnings}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
