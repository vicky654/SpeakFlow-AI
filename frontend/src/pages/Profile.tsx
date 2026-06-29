import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useNavigate } from 'react-router-dom';
import { User, Flame, Coins, Sparkles, Award, Printer, ShieldAlert, Sun, Moon, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const darkMode = useAuthStore(state => state.darkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);
  const { badges, fetchBadges } = useLearningStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const totalLessonsCount = user?.completedLessons.length || 0;
  const isEligibleForCertificate = totalLessonsCount >= 3 || (user?.level && user.level >= 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">My Profile</h2>
        <p className="text-xs text-slate-400">View progress badges, print completions, and manage settings.</p>
      </div>

      {/* 1. PREMIUM PROFILE HEADER CARD */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 bg-gradient-to-r from-indigo-950/20 via-slate-900/60 to-purple-950/15 flex flex-col items-center text-center space-y-3.5">
        <div className="relative">
          {/* Avatar with glowing ring */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg relative z-10">
            {user?.name.charAt(0) || 'S'}
          </div>
          <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-25 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
          <p className="text-[10px] text-slate-500 font-mono">{user?.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] uppercase font-extrabold tracking-wider">
            {user?.role.replace('_', ' ')}
          </span>
        </div>

        {/* Level, streak, coins stats list */}
        <div className="flex items-center space-x-5 pt-2 border-t border-slate-900 w-full justify-center text-xs font-bold text-slate-300">
          <div className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-orange-500 fill-current" />
            <span>{user?.streak} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4 text-amber-500 fill-current" />
            <span>{user?.coins} coins</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-indigo-450" />
            <span>Lvl {user?.level}</span>
          </div>
        </div>
      </div>

      {/* 2. COMPLETION CERTIFICATE CARD */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 space-y-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-200">Certificate of Completion</h3>
          <p className="text-[10px] text-slate-400">Unlock credentials by passing at least 3 lessons.</p>
        </div>

        {isEligibleForCertificate ? (
          <div className="p-4 bg-gradient-to-tr from-amber-950/20 via-slate-900/60 to-amber-950/15 border-2 border-dashed border-amber-500/40 rounded-2xl space-y-3.5 text-center relative overflow-hidden select-none">
            <div className="absolute top-2 right-2 text-2xl opacity-20">📜</div>
            <div className="space-y-1">
              <span className="text-[8px] uppercase tracking-widest font-mono text-amber-500 font-bold">Certificate of Merit</span>
              <h4 className="text-sm font-extrabold text-slate-100">{user?.name}</h4>
              <p className="text-[9px] text-slate-400 leading-normal px-2">
                For outstanding dedication in completing introductory grammar modules, speaking drills, and reading reviews on the SpeakFlow AI platform.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/85 pt-2 text-[8px] font-bold text-slate-500">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span className="text-amber-500">Verified by SpeakFlow AI</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-amber-600 active:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 mt-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        ) : (
          <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-2xl text-center space-y-2 flex flex-col items-center">
            <span className="text-2xl opacity-35">🔒</span>
            <h4 className="text-xs font-bold text-slate-400">Locked</h4>
            <p className="text-[9px] text-slate-500 max-w-xs leading-normal">
              You have completed <span className="text-indigo-400 font-bold">{totalLessonsCount} / 3</span> lessons. Complete more modules to generate your certificate.
            </p>
          </div>
        )}
      </div>

      {/* 3. SETTINGS & ACTIONS LIST CARD */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-200">System Options</h3>
        
        <div className="space-y-2.5">
          {/* Theme switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-900 text-xs">
            <span className="font-semibold text-slate-300">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg font-bold text-slate-300 active:scale-95 transition-transform"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-450" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Admin panel link */}
          {user?.role === 'admin' && (
            <div 
              onClick={() => navigate('/admin')}
              className="flex items-center justify-between p-3 rounded-xl bg-rose-950/10 border border-rose-900/30 text-xs cursor-pointer active:scale-[0.99] transition-transform"
            >
              <span className="font-bold text-rose-400 flex items-center space-x-1.5">
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>Admin Settings Control</span>
              </span>
              <span className="text-[10px] text-rose-500 font-bold uppercase font-mono">Open →</span>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-950/30 border border-slate-905 text-xs text-rose-400 font-bold active:scale-[0.99] transition-transform text-left"
          >
            <span className="flex items-center space-x-1.5">
              <LogOut className="w-4.5 h-4.5 text-rose-400" />
              <span>Sign Out Session</span>
            </span>
            <span className="text-[9px] text-slate-500">Goodbye</span>
          </button>
        </div>
      </div>
    </div>
  );
};
