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
        <h2 className="text-2xl font-extrabold text-white">Your Progress</h2>
        <p className="text-xs text-slate-400">Track stats, view active badges, and check leaderboard standings.</p>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 text-center space-y-1">
          <Flame className="w-5 h-5 text-orange-500 fill-current mx-auto" />
          <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
          <p className="text-base font-extrabold text-white">{user?.streak} days</p>
        </div>
        
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 text-center space-y-1">
          <Sparkles className="w-5 h-5 text-indigo-400 fill-current mx-auto" />
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total XP</p>
          <p className="text-base font-extrabold text-white">{user?.xp} XP</p>
        </div>

        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 text-center space-y-1">
          <Coins className="w-5 h-5 text-amber-400 fill-current mx-auto" />
          <p className="text-[10px] text-slate-400 font-bold uppercase">Coins</p>
          <p className="text-base font-extrabold text-white">{user?.coins}</p>
        </div>
      </div>

      {/* RECHARTS CHART SECTION */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-3">
        <div>
          <h4 className="font-bold text-sm text-slate-200">Practice History</h4>
          <p className="text-[10px] text-slate-400">XP points earned during lessons this week.</p>
        </div>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXpProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="XP" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorXpProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LEADERBOARD STANDINGS */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-200">Leaderboard League</h4>
            <p className="text-[10px] text-slate-400">Weekly rankings. Top rank secures badges.</p>
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
                      ? 'bg-indigo-600/20 border-indigo-500/30' 
                      : 'bg-slate-950/20 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' : 
                      idx === 1 ? 'bg-slate-300 text-slate-950' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-bold ${isCurrentUser ? 'text-indigo-400' : 'text-slate-200'}`}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-400">{entry.xp} <span className="font-normal text-[10px]">XP</span></span>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-slate-500 py-3">Loading leaderboard rankings...</div>
          )}
        </div>
      </div>

      {/* BADGES / ACHIEVEMENTS */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-200">Badges Unlocked</h4>
            <p className="text-[10px] text-slate-400">Unlocks through daily streaks and scoring.</p>
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
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-slate-200' 
                      : 'bg-slate-950/20 border-slate-800/80 opacity-40'
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
            <div className="col-span-2 text-center text-xs text-slate-500 py-3">Loading achievements...</div>
          )}
        </div>
      </div>
    </div>
  );
};
