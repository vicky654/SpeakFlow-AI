import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { ProgressRing } from '../components/ProgressRing';
import { 
  Flame, Award, Sparkles, Coins, ArrowRight,
  BookOpen, Mic, Headset, BookOpenCheck, PenTool, CheckCircle2, Circle
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
    else navigate('/vocab');
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

  const skillModules = [
    { 
      title: 'Vocabulary Cards', 
      desc: 'Master 10 words daily', 
      progress: dailyChallenge?.checklist?.vocab?.completed ? 100 : Math.round(((dailyChallenge?.checklist?.vocab?.current || 0) / 10) * 100),
      label: `${dailyChallenge?.checklist?.vocab?.current || 0}/10 words`,
      icon: BookOpen, 
      color: 'from-blue-500 to-indigo-600',
      strokeColor: 'stroke-blue-500',
      to: '/vocab'
    },
    { 
      title: 'Speaking Drill', 
      desc: 'Answering situational prompts', 
      progress: dailyChallenge?.checklist?.speaking?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.speaking?.completed ? 'Complete' : 'Pending',
      icon: Mic, 
      color: 'from-orange-500 to-amber-600',
      strokeColor: 'stroke-orange-500',
      to: '/speaking'
    },
    { 
      title: 'Listening Dialogue', 
      desc: 'Decode dialogue accents', 
      progress: dailyChallenge?.checklist?.listening?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.listening?.completed ? 'Complete' : 'Pending',
      icon: Headset, 
      color: 'from-emerald-500 to-teal-600',
      strokeColor: 'stroke-emerald-500',
      to: '/listening'
    },
    { 
      title: 'Reading Articles', 
      desc: 'Read articles and write briefs', 
      progress: dailyChallenge?.checklist?.reading?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.reading?.completed ? 'Complete' : 'Pending',
      icon: BookOpenCheck, 
      color: 'from-purple-500 to-pink-600',
      strokeColor: 'stroke-purple-500',
      to: '/reading'
    },
    { 
      title: 'Writing Simulator', 
      desc: 'Practice office emails', 
      progress: dailyChallenge?.checklist?.writing?.completed ? 100 : 0, 
      label: dailyChallenge?.checklist?.writing?.completed ? 'Complete' : 'Pending',
      icon: PenTool, 
      color: 'from-rose-500 to-red-600',
      strokeColor: 'stroke-rose-500',
      to: '/writing'
    }
  ];

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6">
      {/* 1. TOP WELCOME CARD */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/20 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400">Welcome Back</span>
          <h1 className="text-2xl font-extrabold text-white">
            Hello, {user?.name || 'Scholar'} 👋
          </h1>
          <p className="text-[11px] text-slate-400 leading-normal">
            You are mastering communication at <span className="text-indigo-400 font-bold">Level {user?.level}</span>. Drill today's recommended exercises to preserve your daily streak.
          </p>
        </div>

        <button
          onClick={handleContinueLearning}
          className="flex items-center justify-between w-full px-5 py-3 bg-indigo-600 active:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 text-xs"
        >
          <span>Continue Lesson Checklist</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. STATS COMPACT GRID */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Streak</p>
            <p className="text-sm font-extrabold text-white truncate">{user?.streak} Days</p>
          </div>
        </div>

        {/* XP Points */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Total XP</p>
            <p className="text-sm font-extrabold text-white truncate">{user?.xp} XP</p>
          </div>
        </div>

        {/* Coins */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Coins className="w-5 h-5 fill-current animate-bounce" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Coins</p>
            <p className="text-sm font-extrabold text-white truncate">{user?.coins}</p>
          </div>
        </div>

        {/* Level */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Level</p>
            <p className="text-sm font-extrabold text-white truncate">Lvl {user?.level}</p>
          </div>
        </div>
      </div>

      {/* 3. DAILY CHALLENGE TASKS CARD */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200/10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div>
            <h3 className="font-extrabold text-sm text-slate-200">Daily Challenge</h3>
            <p className="text-[10px] text-slate-400">Complete tasks to earn +100 XP bonus</p>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            Today
          </span>
        </div>

        <div className="space-y-2">
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
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
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
            <div className="text-center text-xs text-slate-500 py-3">Loading daily checklist...</div>
          )}
        </div>
      </div>

      {/* 4. WEEKLY PROGRESS CHART */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200/10 space-y-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-200">Study Analytics</h3>
          <p className="text-[10px] text-slate-400">Weekly breakdown of daily XP points earned.</p>
        </div>
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorXpHome" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="XP" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorXpHome)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. COMMUNICATION LEARNING MODULES GRID */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-200 pl-1">Quick Syllabus Drill</h3>
        <div className="grid grid-cols-1 gap-3">
          {skillModules.slice(0, 3).map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div 
                key={idx} 
                onClick={() => navigate(mod.to)}
                className="glass-card rounded-2xl p-4 border border-slate-200/10 hover:border-indigo-500/30 transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${mod.color} text-white shrink-0`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-200 truncate">{mod.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{mod.desc}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <ProgressRing radius={14} stroke={2.2} progress={mod.progress} color={mod.strokeColor} />
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
