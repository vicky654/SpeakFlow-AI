import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Coins, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHeader: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-4 z-40 select-none safe-top">
      
      {/* 1. LEFT SIDE: App Logo & SpeakFlow AI */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <span className="font-extrabold tracking-tight text-white font-sans text-xs sm:text-sm">
          SpeakFlow <span className="text-indigo-400">AI</span>
        </span>
      </div>

      {/* 2. CENTER: XP, Coins, Streak */}
      {user && (
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* XP */}
          <div className="flex items-center space-x-0.5 bg-indigo-500/10 border border-indigo-550/20 px-2 py-1 rounded-full text-[9px] font-black text-indigo-400">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>{user.xp} XP</span>
          </div>

          {/* Coins */}
          <div className="flex items-center space-x-0.5 bg-amber-500/10 border border-amber-550/20 px-2 py-1 rounded-full text-[9px] font-black text-amber-400">
            <Coins className="w-2.5 h-2.5 fill-current" />
            <span>{user.coins}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center space-x-0.5 bg-orange-500/10 border border-orange-550/20 px-2 py-1 rounded-full text-[9px] font-black text-orange-500">
            <Flame className="w-2.5 h-2.5 fill-current" />
            <span>{user.streak}d</span>
          </div>
        </div>
      )}

      {/* 3. RIGHT SIDE: Profile Avatar */}
      {user ? (
        <div 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full border-2 border-indigo-500/30 hover:border-indigo-400 flex items-center justify-center bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase cursor-pointer active:scale-95 transition-transform shrink-0"
        >
          {user.name.charAt(0)}
        </div>
      ) : (
        <div className="w-8 h-8 shrink-0" />
      )}

    </header>
  );
};
