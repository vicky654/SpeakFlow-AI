import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sun, Moon, Flame, Sparkles, Coins, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const user = useAuthStore(state => state.user);
  const darkMode = useAuthStore(state => state.darkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);

  return (
    <header className="h-16 w-full glass-nav flex items-center justify-between px-6 select-none sticky top-0 z-40">
      {/* MOBILE TRIGGER */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg bg-brand-surface/40 border border-brand-border/40 text-brand-text-secondary hover:text-white md:hidden transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="md:hidden">
          <span className="font-extrabold tracking-tight text-white font-sans text-sm">SpeakFlow <span className="text-indigo-400">AI</span></span>
        </div>
      </div>

      {/* METRICS & CONTROLS */}
      <div className="flex items-center space-x-4 ml-auto">
        {user && (
          <div className="flex items-center space-x-3">
            {/* XP Points */}
            <div className="flex items-center space-x-1.5 bg-brand-surface/40 dark:bg-brand-surface/60 border border-brand-border px-3 py-1.5 rounded-full text-xs font-bold text-brand-text-secondary">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-current" />
              <span>{user.xp} <span className="text-brand-text-muted font-normal">XP</span></span>
            </div>

            {/* Coins */}
            <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-amber-400">
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-current animate-bounce" />
              <span>{user.coins} <span className="text-amber-500/60 font-normal">Coins</span></span>
            </div>

            {/* Streak Indicator (Navbar detail) */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-orange-500">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
              <span>{user.streak} <span className="text-orange-500/60 font-normal">days</span></span>
            </div>
          </div>
        )}

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-brand-surface/40 border border-brand-border text-brand-text-secondary hover:text-white transition-all hover:scale-105"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
