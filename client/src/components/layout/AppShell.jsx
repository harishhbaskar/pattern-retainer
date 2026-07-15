import { useState, useRef, useEffect } from 'react';
import { Plus, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Button from '../ui/Button.jsx';
import PageHeader from '../ui/PageHeader.jsx';

const VIEW_TITLES = {
  dashboard: { title: 'Today', subtitle: 'Patterns due for review right now' },
  calendar: { title: 'Schedule', subtitle: 'Upcoming review timeline across the month' },
  all: { title: 'Your Library', subtitle: 'Every learning pattern you have captured' },
  stats: { title: 'Your Progress', subtitle: 'Retention activity and historical performance' },
};

const AppShell = ({
  view,
  setView,
  user,
  onLogout,
  onOpenCaptureModal,
  refreshTrigger,
  children,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentHeader = VIEW_TITLES[view] || { title: 'Pattern Retainer', subtitle: '' };

  // Calculate initials from user.name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B1120] text-slate-100 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar view={view} setView={setView} refreshTrigger={refreshTrigger} />

      {/* Main Content Region */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-100 md:hidden">{currentHeader.title}</h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Capture Pattern Button */}
            <Button
              variant="primary"
              onClick={onOpenCaptureModal}
              className="!py-2 !px-3.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Capture Pattern</span>
            </Button>

            {/* User Dropdown Control */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] border border-slate-700/60 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                    {getInitials(user.name)}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-200">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-700/60 text-xs text-slate-400 truncate">
                      Signed in as <strong className="text-slate-200 block truncate">{user.email}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {view !== 'dashboard' && (
            <PageHeader
              title={currentHeader.title}
              subtitle={currentHeader.subtitle}
            />
          )}
          <div className={view !== 'dashboard' ? 'mt-6' : ''}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppShell;
