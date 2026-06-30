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
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6 text-brand-text-primary">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">My Profile</h2>
        <p className="text-xs text-brand-text-secondary">View progress badges, print completions, and manage settings.</p>
      </div>

      {/* 1. PREMIUM PROFILE HEADER CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border flex flex-col items-center text-center space-y-3.5">
        <div className="relative">
          {/* Avatar with glowing ring */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary via-brand-accent to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg relative z-10">
            {user?.name.charAt(0) || 'S'}
          </div>
          <div className="absolute -inset-1 bg-brand-primary rounded-full blur opacity-25 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-text-primary">{user?.name}</h2>
          <p className="text-[10px] text-brand-text-muted font-mono">{user?.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[9px] uppercase font-extrabold tracking-wider">
            {user?.role.replace('_', ' ')}
          </span>
        </div>

        {/* Level, streak, coins stats list */}
        <div className="flex items-center space-x-5 pt-2 border-t border-brand-border w-full justify-center text-xs font-bold text-brand-text-secondary">
          <div className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-brand-error fill-current" />
            <span>{user?.streak} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4 text-brand-warning fill-current" />
            <span>{user?.coins} coins</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Lvl {user?.level}</span>
          </div>
        </div>
      </div>

      {/* 2. COMPLETION CERTIFICATE CARD */}
      <div className="bg-brand-card rounded-2xl p-5 border border-brand-border space-y-4 shadow-level-1">
        <div>
          <h3 className="font-medium text-sm text-brand-text-primary">Certificate of Completion</h3>
          <p className="text-[10px] text-brand-text-secondary">Unlock credentials by passing at least 3 lessons.</p>
        </div>

        {isEligibleForCertificate ? (
          <div className="p-5 bg-gradient-to-tr from-brand-warning/5 via-brand-surface to-brand-warning/10 border-2 border-double border-brand-warning/30 rounded-2xl space-y-4 text-center relative overflow-hidden select-none shadow-sm">
            <div className="absolute top-2 right-2 text-3xl opacity-10 pointer-events-none">📜</div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-brand-warning">Certificate of Merit</span>
              <h4 className="text-base font-semibold text-brand-text-primary">{user?.name}</h4>
              <p className="text-[10px] text-brand-text-secondary leading-relaxed px-1">
                For outstanding dedication in completing introductory grammar modules, speaking drills, and reading reviews on the SpeakFlow AI platform.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-brand-border pt-2.5 text-[9px] font-medium text-brand-text-muted">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span className="text-brand-warning font-semibold">Verified by SpeakFlow AI</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-brand-warning hover:brightness-105 active:scale-[0.99] text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center space-x-1.5 mt-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        ) : (
          <div className="p-5 bg-brand-surface border border-brand-border rounded-xl text-center space-y-2.5 flex flex-col items-center">
            <span className="text-2xl opacity-40">🔒</span>
            <h4 className="text-xs font-medium text-brand-text-secondary">Locked</h4>
            <p className="text-[10px] text-brand-text-secondary max-w-xs leading-relaxed">
              You have completed <span className="text-brand-primary font-semibold">{totalLessonsCount} / 3</span> lessons. Complete more modules to generate your certificate.
            </p>
          </div>
        )}
      </div>

      {/* 3. SETTINGS & ACTIONS LIST CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border space-y-4">
        <h3 className="font-extrabold text-sm text-brand-text-primary">System Options</h3>
        
        <div className="space-y-2.5">
          {/* Theme switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-border text-xs">
            <span className="font-semibold text-brand-text-secondary">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1 bg-brand-bg border border-brand-border rounded-lg font-bold text-brand-text-primary active:scale-95 transition-transform"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-brand-warning" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Admin panel link */}
          {user?.role === 'admin' && (
            <div 
              onClick={() => navigate('/admin')}
              className="flex items-center justify-between p-3 rounded-xl bg-brand-error/10 border border-brand-error/20 text-xs cursor-pointer active:scale-[0.99] transition-transform"
            >
              <span className="font-bold text-brand-error flex items-center space-x-1.5">
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>Admin Settings Control</span>
              </span>
              <span className="text-[10px] text-brand-error font-bold uppercase font-mono">Open →</span>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-error font-bold active:scale-[0.99] transition-transform text-left"
          >
            <span className="flex items-center space-x-1.5">
              <LogOut className="w-4.5 h-4.5 text-brand-error" />
              <span>Sign Out Session</span>
            </span>
            <span className="text-[9px] text-brand-text-muted">Goodbye</span>
          </button>
        </div>
      </div>

      {/* 4. BADGES GRID CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border space-y-4">
        <div>
          <h3 className="font-extrabold text-sm text-brand-text-primary">Earned Badges</h3>
          <p className="text-[10px] text-brand-text-secondary">Milestone rewards achieved during active learning.</p>
        </div>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-4 gap-2.5 pt-1">
            {badges.map((badge: any, i: number) => {
              // Match by either badge ID or badge name string
              const isEarned = user?.badges?.some((ub: string) => ub === badge._id || ub === badge.name || ub === badge.key);
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center p-2.5 rounded-2xl text-center space-y-1 border ${
                    isEarned 
                      ? 'bg-brand-primary/15 border-brand-primary/20 text-brand-text-primary' 
                      : 'bg-brand-surface border-brand-border opacity-30'
                  }`}
                >
                  <span className="text-2xl">{badge.icon || '🏅'}</span>
                  <span className="text-[8px] font-black text-brand-text-secondary truncate w-full block mt-0.5">{badge.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-brand-text-muted py-3">No badges loaded yet.</div>
        )}
      </div>
    </div>
  );
};
