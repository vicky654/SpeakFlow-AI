import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Coins, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-6 z-40 select-none safe-top">
      
      {/* 1. LEFT SIDE: App Logo & SpeakFlow AI */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary via-brand-accent to-pink-500 flex items-center justify-center shadow-level-1 shadow-brand-primary/10">
          <span className="text-xs font-semibold text-white">S</span>
        </div>
        <span className="font-semibold tracking-tight text-brand-text-primary font-sans text-xs sm:text-sm">
          SpeakFlow <span className="text-brand-primary">AI</span>
        </span>
      </div>

      {/* 2. CENTER: XP, Coins, Streak */}
      {user && (
        <div className="flex items-center space-x-2">
          {/* XP */}
          <div className="flex items-center space-x-1 bg-brand-info/10 border border-brand-info/20 px-2.5 py-1 rounded-full text-[10px] font-medium text-brand-info">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{user.xp} XP</span>
          </div>

          {/* Coins */}
          <div className="flex items-center space-x-1 bg-brand-warning/10 border border-brand-warning/20 px-2.5 py-1 rounded-full text-[10px] font-medium text-brand-warning">
            <Coins className="w-3 h-3 fill-current" />
            <span>{user.coins}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center space-x-1 bg-brand-error/10 border border-brand-error/20 px-2.5 py-1 rounded-full text-[10px] font-medium text-brand-error">
            <Flame className="w-3 h-3 fill-current" />
            <span>{user.streak}d</span>
          </div>
        </div>
      )}

      {/* 3. RIGHT SIDE: Profile Avatar */}
      {user ? (
        <div 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full border border-brand-primary/20 hover:border-brand-primary/50 flex items-center justify-center bg-brand-primary/10 text-brand-primary text-xs font-medium uppercase cursor-pointer hover:scale-105 active:scale-95 transition-all shrink-0 shadow-level-1"
        >
          {user.name.charAt(0)}
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0" />
      )}
    </header>
  );
};
