import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Coins, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-surface/85 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-4 z-40 select-none safe-top shadow-sm">
      
      {/* 1. LEFT SIDE: App Logo & SpeakFlow AI */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
      >
        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-sm">
          <span className="text-sm font-semibold text-white font-sans">S</span>
        </div>
        <span className="font-bold tracking-tight text-brand-text-primary text-sm">
          SpeakFlow <span className="text-brand-primary">AI</span>
        </span>
      </div>

      {/* 2. CENTER & RIGHT: Stats + Profile */}
      {user && (
        <div className="flex items-center space-x-2">
          {/* XP */}
          <div className="flex items-center space-x-1 bg-brand-info/10 border border-brand-info/15 px-2.5 py-1 rounded-full text-[10px] font-semibold text-brand-info">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{user.xp}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center space-x-1 bg-brand-warning/10 border border-brand-warning/15 px-2.5 py-1 rounded-full text-[10px] font-semibold text-brand-warning">
            <Coins className="w-3 h-3 fill-current" />
            <span>{user.coins}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center space-x-1 bg-brand-error/10 border border-brand-error/15 px-2.5 py-1 rounded-full text-[10px] font-semibold text-brand-error">
            <Flame className="w-3 h-3 fill-current" />
            <span>{user.streak}d</span>
          </div>

          {/* Profile Avatar */}
          <div 
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full border border-brand-primary/20 hover:border-brand-primary/50 flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 shadow-sm"
          >
            {user.name.charAt(0)}
          </div>
        </div>
      )}
    </header>
  );
};
