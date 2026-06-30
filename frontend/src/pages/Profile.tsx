import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Flame, Coins, Sparkles, Award, Printer, ShieldAlert, 
  Sun, Moon, LogOut, Trophy, CheckCircle2 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const darkMode = useAuthStore(state => state.darkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);
  
  const { leaderboard, badges, fetchLeaderboard, fetchBadges } = useLearningStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
  }, [fetchLeaderboard, fetchBadges]);

  const totalLessonsCount = user?.completedLessons.length || 0;
  const isEligibleForCertificate = totalLessonsCount >= 3 || (user?.level && user.level >= 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const weeklyData = [
    { name: 'Mon', XP: 45 },
    { name: 'Tue', XP: 80 },
    { name: 'Wed', XP: 65 },
    { name: 'Thu', XP: 110 },
    { name: 'Fri', XP: 90 },
    { name: 'Sat', XP: 140 },
    { name: 'Sun', XP: user?.xp ? Math.min(200, user.xp) : 100 },
  ];

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-12 text-brand-text-primary">
      
      {/* HEADER SECTION */}
      <div className="space-y-1 text-left px-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">My Profile</h2>
        <p className="text-xs text-brand-text-secondary">Manage settings, view statistics, and review earned certificates.</p>
      </div>

      {/* 1. PREMIUM PROFILE HEADER CARD */}
      <div className="card flex flex-col items-center text-center space-y-4 py-6">
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
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/10 text-indigo-500 border border-indigo-500/20 text-[9px] uppercase font-extrabold tracking-wider">
            {user?.role.replace('_', ' ')}
          </span>
        </div>

        {/* Level, streak, coins stats list */}
        <div className="flex items-center space-x-5 pt-3 border-t border-brand-border w-full justify-center text-xs font-bold text-brand-text-secondary">
          <div className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-brand-error fill-current animate-pulse" />
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

      {/* 2. PRACTICE HISTORY CHART CARD */}
      <div className="card space-y-3.5 text-left">
        <div>
          <h4 className="font-bold text-sm text-brand-text-primary">Practice History</h4>
          <p className="text-[10px] text-brand-text-secondary">XP points earned during lessons this week.</p>
        </div>
        <div className="w-full h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXpProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={9} tickLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}
                labelStyle={{ color: 'var(--color-text-secondary)', fontSize: '10px', fontWeight: '500' }}
                itemStyle={{ color: 'var(--color-primary)', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="XP" stroke="#6D5DF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorXpProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. LEADERBOARD STANDINGS LEAGUE */}
      <div className="card space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-brand-text-primary">Leaderboard League</h4>
            <p className="text-[10px] text-brand-text-secondary">Weekly rankings. Top rank secures badges.</p>
          </div>
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>

        <div className="space-y-2 pt-1">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((entry, idx) => {
              const isCurrentUser = entry.name === user?.name;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    isCurrentUser 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-gray-150 text-brand-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' : 
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-semibold ${isCurrentUser ? 'text-indigo-700 font-bold' : 'text-brand-text-primary'}`}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-semibold text-brand-text-secondary">{entry.xp} <span className="font-normal text-[10px]">XP</span></span>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-brand-text-muted py-3">Loading leaderboard rankings...</div>
          )}
        </div>
      </div>

      {/* 4. EARNED BADGES CABINET */}
      <div className="card space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-brand-text-primary">Earned Badges</h3>
            <p className="text-[10px] text-brand-text-secondary">Milestone rewards achieved during active learning.</p>
          </div>
          <Award className="w-5 h-5 text-indigo-500" />
        </div>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-4 gap-2.5 pt-1">
            {badges.map((badge: any, i: number) => {
              const isEarned = user?.badges?.some((ub: string) => ub === badge._id || ub === badge.name || ub === badge.key);
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center p-2 rounded-2xl text-center space-y-1 border ${
                    isEarned 
                      ? 'bg-indigo-50 border-indigo-100 text-brand-text-primary' 
                      : 'bg-white border-gray-100 opacity-30'
                  }`}
                >
                  <span className="text-2xl">{badge.icon || '🏅'}</span>
                  <span className="text-[8px] font-bold text-brand-text-secondary truncate w-full block mt-0.5">{badge.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-brand-text-muted py-3">No badges loaded yet.</div>
        )}
      </div>

      {/* 5. COMPLETION CERTIFICATE CARD */}
      <div className="card space-y-4 text-left">
        <div>
          <h3 className="font-bold text-sm text-brand-text-primary">Certificate of Completion</h3>
          <p className="text-[10px] text-brand-text-secondary">Unlock credentials by passing at least 3 lessons.</p>
        </div>

        {isEligibleForCertificate ? (
          <div className="p-5 bg-gradient-to-tr from-amber-500/5 via-brand-surface to-brand-warning/10 border-2 border-double border-amber-250 rounded-2xl space-y-4 text-center relative overflow-hidden select-none shadow-sm">
            <div className="absolute top-2 right-2 text-3xl opacity-10 pointer-events-none">📜</div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-amber-600">Certificate of Merit</span>
              <h4 className="text-base font-bold text-brand-text-primary">{user?.name}</h4>
              <p className="text-[10px] text-brand-text-secondary leading-relaxed px-1">
                For outstanding dedication in completing introductory grammar modules, speaking drills, and reading reviews on the SpeakFlow AI platform.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-brand-border pt-2.5 text-[9px] font-medium text-brand-text-muted">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span className="text-amber-600 font-semibold">Verified by SpeakFlow AI</span>
            </div>

            <button
              onClick={() => window.print()}
              style={{ borderRadius: '12px', padding: '10px' }}
              className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center space-x-1.5 mt-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        ) : (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-2 flex flex-col items-center">
            <span className="text-xl opacity-40">🔒</span>
            <h4 className="text-xs font-bold text-brand-text-secondary">Locked</h4>
            <p className="text-[10px] text-brand-text-secondary max-w-xs leading-relaxed">
              You have completed <span className="text-indigo-600 font-bold">{totalLessonsCount} / 3</span> lessons. Complete more modules to generate your certificate.
            </p>
          </div>
        )}
      </div>

      {/* 6. SETTINGS OPTIONS */}
      <div className="card space-y-4 text-left">
        <h3 className="font-bold text-sm text-brand-text-primary">System Settings</h3>
        
        <div className="space-y-2.5">
          {/* Theme switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-150 text-xs">
            <span className="font-semibold text-brand-text-secondary">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1 bg-brand-bg border border-brand-border rounded-lg font-bold text-brand-text-primary active:scale-95 transition-transform"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-brand-warning animate-spin-slow" />
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
              className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-xs cursor-pointer active:scale-[0.99] transition-transform"
            >
              <span className="font-bold text-red-650 flex items-center space-x-1.5">
                <ShieldAlert className="w-4.5 h-4.5" />
                <span>Admin Settings Control</span>
              </span>
              <span className="text-[10px] text-red-650 font-bold uppercase font-mono">Open →</span>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-gray-150 text-xs text-brand-error font-bold active:scale-[0.99] transition-transform text-left"
          >
            <span className="flex items-center space-x-1.5">
              <LogOut className="w-4.5 h-4.5 text-brand-error animate-pulse" />
              <span>Sign Out Session</span>
            </span>
            <span className="text-[9px] text-brand-text-muted">Goodbye</span>
          </button>
        </div>
      </div>

    </div>
  );
};
