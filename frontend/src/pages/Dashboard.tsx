import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { ProgressRing } from '../components/ProgressRing';
import { 
  Flame, Award, Target, Sparkles, Coins, ArrowRight,
  BookOpen, Mic, Headset, BookOpenCheck, PenTool, CheckCircle, Circle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const { dailyChallenge, fetchDailyChallenge, fetchLeaderboard } = useLearningStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyChallenge();
    fetchLeaderboard();
  }, [fetchDailyChallenge, fetchLeaderboard]);

  const handleContinueLearning = () => {
    // Determine where to send them based on what's incomplete in daily challenge
    if (!dailyChallenge) {
      navigate('/vocab');
      return;
    }
    const { checklist } = dailyChallenge;
    if (!checklist.vocab.completed) navigate('/vocab');
    else if (!checklist.quiz.completed) navigate('/grammar');
    else if (!checklist.speaking.completed) navigate('/speaking');
    else if (!checklist.reading.completed) navigate('/reading');
    else if (!checklist.listening.completed) navigate('/listening');
    else if (!checklist.writing.completed) navigate('/writing');
    else navigate('/vocab'); // default
  };

  // Mock data for weekly analytics chart
  const weeklyData = [
    { name: 'Mon', XP: 45, 'Practice Time (min)': 12 },
    { name: 'Tue', XP: 80, 'Practice Time (min)': 20 },
    { name: 'Wed', XP: 65, 'Practice Time (min)': 15 },
    { name: 'Thu', XP: 110, 'Practice Time (min)': 30 },
    { name: 'Fri', XP: 90, 'Practice Time (min)': 25 },
    { name: 'Sat', XP: 140, 'Practice Time (min)': 35 },
    { name: 'Sun', XP: user?.xp ? Math.min(200, user.xp) : 100, 'Practice Time (min)': 40 },
  ];

  const skillModules = [
    { 
      title: 'Vocabulary booster', 
      desc: 'Master 10 words daily', 
      progress: dailyChallenge?.checklist?.vocab?.completed ? 100 : Math.round(((dailyChallenge?.checklist?.vocab?.current || 0) / 10) * 100),
      label: `${dailyChallenge?.checklist?.vocab?.current || 0}/10 words`,
      icon: BookOpen, 
      color: 'from-blue-500 to-indigo-600',
      strokeColor: 'stroke-blue-500',
      to: '/vocab'
    },
    { 
      title: 'Speaking Fluency', 
      desc: 'Drill office meeting prompts', 
      progress: dailyChallenge?.checklist?.speaking?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.speaking?.completed ? 'Complete' : 'Pending',
      icon: Mic, 
      color: 'from-orange-500 to-amber-600',
      strokeColor: 'stroke-orange-500',
      to: '/speaking'
    },
    { 
      title: 'Listening Dialogue', 
      desc: 'Decode accents and podcasts', 
      progress: dailyChallenge?.checklist?.listening?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.listening?.completed ? 'Complete' : 'Pending',
      icon: Headset, 
      color: 'from-emerald-500 to-teal-600',
      strokeColor: 'stroke-emerald-500',
      to: '/listening'
    },
    { 
      title: 'Reading comprehension', 
      desc: 'Read articles and write briefs', 
      progress: dailyChallenge?.checklist?.reading?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.reading?.completed ? 'Complete' : 'Pending',
      icon: BookOpenCheck, 
      color: 'from-purple-500 to-pink-600',
      strokeColor: 'stroke-purple-500',
      to: '/reading'
    },
    { 
      title: 'Writing exercise', 
      desc: 'Practice reports and emails', 
      progress: dailyChallenge?.checklist?.writing?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.writing?.completed ? 'Complete' : 'Pending',
      icon: PenTool, 
      color: 'from-rose-500 to-red-600',
      strokeColor: 'stroke-rose-500',
      to: '/writing'
    }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* 1. WELCOME BANNER */}
      <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/20">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Hello, {user?.name || 'Scholar'}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            You are currently on <span className="text-indigo-400 font-bold">Level {user?.level}</span>.
            Keep practicing daily to grow your streak and secure badges!
          </p>
        </div>
        <button
          onClick={handleContinueLearning}
          className="flex items-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/25 shrink-0 group text-sm"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Daily Streak</p>
            <p className="text-xl font-extrabold text-white">{user?.streak} Days</p>
          </div>
        </div>

        {/* XP Points */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total XP Points</p>
            <p className="text-xl font-extrabold text-white">{user?.xp} XP</p>
          </div>
        </div>

        {/* Coins */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Coins className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Coins Earned</p>
            <p className="text-xl font-extrabold text-white">{user?.coins}</p>
          </div>
        </div>

        {/* Level badge */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Current Level</p>
            <p className="text-xl font-extrabold text-white">Level {user?.level}</p>
          </div>
        </div>
      </div>

      {/* 3. CHALLENGE & PROGRESS SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* DAILY CHALLENGE LIST */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 xl:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-200">Daily Challenge</h3>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                Today
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete these tasks today to secure <span className="text-amber-400 font-bold">+100 XP & +20 Coins</span> bonus!</p>
            
            <div className="space-y-3 pt-2">
              {dailyChallenge?.checklist ? (
                Object.entries(dailyChallenge.checklist).map(([key, value]: any) => {
                  const labelMap: any = {
                    vocab: 'Learn 10 Vocabulary Words',
                    speaking: 'Complete 1 Speaking Drill',
                    reading: 'Read 1 Practice Story',
                    listening: 'Complete 1 Listening Scenario',
                    writing: 'Complete 1 Writing Task',
                    quiz: 'Pass 1 Grammar Course Quiz'
                  };
                  return (
                    <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/30 border border-slate-900">
                      <div className="flex items-center space-x-3 text-xs">
                        {value.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className={value.completed ? 'text-slate-400 line-through' : 'text-slate-300 font-semibold'}>
                          {labelMap[key]}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {value.current}/{value.target}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-slate-500">
                  Loading daily tasks...
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Bonus Chest Reward</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${dailyChallenge?.allCompleted ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                {dailyChallenge?.rewardClaimed ? 'Claimed 🎉' : 'Locked 🔒'}
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS CHARTS */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-200">Practice History</h3>
              <p className="text-xs text-slate-400">Weekly breakdown of study durations and XP points gained.</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">XP gained</span>
              </div>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="XP" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. MODULE QUICK LIST */}
      <div className="space-y-4 pt-2">
        <h3 className="font-extrabold text-lg text-slate-200">Communication Learning Modules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {skillModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div 
                key={idx} 
                onClick={() => navigate(mod.to)}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between h-48 group"
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-lg shadow-indigo-600/10`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ProgressRing radius={20} stroke={2.5} progress={mod.progress} color={mod.strokeColor} />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-950">
                  {mod.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
