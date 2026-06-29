import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Coins, Flame, Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const darkMode = useAuthStore(state => state.darkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/10 dark:border-slate-800/80 flex items-center justify-between px-4 z-40 select-none safe-top">
      {/* 1. BRAND LOGO */}
      <div className="flex items-center space-x-2" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="font-extrabold tracking-tight text-white font-sans text-sm">
          SpeakFlow <span className="text-indigo-400">AI</span>
        </span>
      </div>

      {/* 2. STATS & PRESETS */}
      <div className="flex items-center space-x-2.5">
        {user && (
          <React.Fragment>
            {/* Streak */}
            <div 
              onClick={() => navigate('/progress')}
              className="flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-full text-[10px] font-bold text-orange-500 active:scale-95 transition-transform"
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>{user.streak}d</span>
            </div>

            {/* XP Points */}
            <div 
              onClick={() => navigate('/progress')}
              className="flex items-center space-x-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full text-[10px] font-bold text-indigo-400 active:scale-95 transition-transform"
            >
              <Sparkles className="w-3 h-3 fill-current" />
              <span>{user.xp} <span className="text-slate-500 font-normal">XP</span></span>
            </div>

            {/* Coins */}
            <div 
              onClick={() => navigate('/progress')}
              className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full text-[10px] font-bold text-amber-400 active:scale-95 transition-transform"
            >
              <Coins className="w-3 h-3 fill-current" />
              <span>{user.coins}</span>
            </div>

            {/* User Avatar */}
            <div 
              onClick={() => navigate('/profile')}
              className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase cursor-pointer active:scale-95 transition-transform"
            >
              {user.name.charAt(0)}
            </div>
          </React.Fragment>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 active:scale-95 transition-transform"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
