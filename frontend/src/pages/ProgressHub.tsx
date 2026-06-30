import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, Star, Sparkles, Coins, Flame, Award, ArrowUp } from 'lucide-react';

export const ProgressHub: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const { leaderboard, badges, fetchLeaderboard, fetchBadges } = useLearningStore();

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
  }, [fetchLeaderboard, fetchBadges]);

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
    <div className="space-y-6 pb-6 select-none max-w-lg mx-auto">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">Your Progress</h2>
        <p className="text-xs text-brand-text-secondary">Track stats, view active badges, and check leaderboard standings.</p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-3.5 text-center space-y-1">
          <Flame className="w-5 h-5 text-orange-500 fill-current mx-auto animate-pulse" />
          <p className="text-[10px] text-brand-text-secondary font-bold uppercase">Streak</p>
          <p className="text-base font-extrabold text-brand-text-primary">{user?.streak} days</p>
        </div>
        
        <div className="card !p-3.5 text-center space-y-1">
          <Sparkles className="w-5 h-5 text-indigo-400 fill-current mx-auto" />
          <p className="text-[10px] text-brand-text-secondary font-bold uppercase">Total XP</p>
          <p className="text-base font-extrabold text-brand-text-primary">{user?.xp} XP</p>
        </div>

        <div className="card !p-3.5 text-center space-y-1">
          <Coins className="w-5 h-5 text-amber-400 fill-current mx-auto" />
          <p className="text-[10px] text-brand-text-secondary font-bold uppercase">Coins</p>
          <p className="text-base font-extrabold text-brand-text-primary">{user?.coins}</p>
        </div>
      </div>

      {/* RECHARTS CHART SECTION */}
      <div className="card space-y-3">
        <div>
          <h4 className="font-bold text-sm text-brand-text-primary">Practice History</h4>
          <p className="text-[10px] text-brand-text-secondary">XP points earned during lessons this week.</p>
        </div>
        <div className="w-full h-44">
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

      {/* LEADERBOARD STANDINGS */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-brand-text-primary">Leaderboard League</h4>
            <p className="text-[10px] text-brand-text-secondary">Weekly rankings. Top rank secures badges.</p>
          </div>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>

        <div className="space-y-2 pt-1">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((entry, idx) => {
              const isCurrentUser = entry.name === user?.name;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                    isCurrentUser 
                      ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' 
                      : 'bg-brand-surface border-brand-border text-brand-text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' : 
                      idx === 1 ? 'bg-slate-200 text-slate-800' :
                      idx === 2 ? 'bg-amber-600 text-white' : 'bg-brand-bg text-brand-text-secondary border border-brand-border'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-semibold ${isCurrentUser ? 'text-brand-primary' : 'text-brand-text-primary'}`}>
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

      {/* BADGES / ACHIEVEMENTS */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-brand-text-primary">Badges Unlocked</h4>
            <p className="text-[10px] text-brand-text-secondary">Unlocks through daily streaks and scoring.</p>
          </div>
          <Award className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {badges && badges.length > 0 ? (
            badges.map((badge, idx) => {
              const hasBadge = user?.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 ${
                    hasBadge 
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-brand-text-primary' 
                      : 'bg-brand-bg/20 border-brand-border opacity-40'
                  }`}
                >
                  <span className="text-2xl">{badge.icon || '🏅'}</span>
                  <div>
                    <p className="font-bold text-[11px] truncate w-full">{badge.title}</p>
                    <span className="text-[9px] text-slate-550 leading-normal block">{badge.description}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-xs text-brand-text-muted py-3">Loading achievements...</div>
          )}
        </div>
      </div>
    </div>
  );
};
