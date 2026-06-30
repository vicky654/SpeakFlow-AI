import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useChallengeStore } from '../store/challengeStore';
import { Flame, Sparkles, Target, Play, CheckCircle2, ChevronRight, Award, BookOpen, Clock, Zap } from 'lucide-react';
import { IonRefresher, IonRefresherContent } from '@ionic/react';

// Inline Mini SVG Progress Ring
const ProgressRingMini: React.FC<{ pct: number }> = ({ pct }) => {
  const radius = 14;
  const stroke = 3;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle 
          stroke="rgba(255, 255, 255, 0.05)" 
          fill="transparent" 
          strokeWidth={stroke} 
          r={normalizedRadius} 
          cx={radius} 
          cy={radius} 
        />
        <circle 
          stroke="#6366f1" 
          fill="transparent" 
          strokeWidth={stroke} 
          strokeDasharray={`${circumference} ${circumference}`} 
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }} 
          strokeLinecap="round" 
          r={normalizedRadius} 
          cx={radius} 
          cy={radius} 
        />
      </svg>
      <span className="absolute text-[8px] font-bold text-slate-350">{pct}%</span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const loadUser = useAuthStore(state => state.loadUser);
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const { progress, fetchProgress } = useChallengeStore();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
    fetchProgress();
  }, [fetchDailyChallenge, fetchProgress]);

  const currentDay = progress?.currentDay || 1;

  const dayTopics: Record<number, string> = {
    1: 'Greetings & Polite Words',
    2: 'Introducing Yourself',
    3: 'Talking About Family',
    4: 'Shopping for Clothes',
    5: 'At the Restaurant',
    6: 'Asking for Directions',
    7: 'Hobbies & Free Time',
    8: 'Work & Daily Routines',
    9: 'Weather & Clothes',
    10: 'Health & Doctor Visits',
    11: 'Making Appointments',
    12: 'Phone Conversations',
    13: 'Travel and Booking',
    14: 'Emergency Expressions',
    15: 'Graduation Ceremony'
  };

  const handleContinueLearning = () => {
    // Navigation automatically opens the active drill screen
    navigate(`/challenge/day/${currentDay}`);
  };

  const handleRefresh = async (event: any) => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDailyChallenge(),
        fetchProgress(),
        loadUser ? loadUser() : Promise.resolve()
      ]);
    } catch (e) {
      console.error('Failed to pull-to-refresh dashboard:', e);
    } finally {
      setRefreshing(false);
      event.detail.complete();
    }
  };

  // Calculate Progress Percent
  const checklist = dailyChallenge?.checklist || {};
  const checklistItems = Object.entries(checklist);
  const totalTasks = checklistItems.length || 6;
  const completedTasks = checklistItems.filter(([_, v]: any) => v.completed).length;
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  // Metadata mapping for custom interactive Daily Goals Cards
  const goalMetadata: Record<string, { label: string; time: string; xp: string; route: string }> = {
    vocab: { label: 'Learn 10 Vocabulary Words', time: '10 min', xp: '+25 XP', route: '/vocab' },
    speaking: { label: 'Complete 1 Speaking Drill', time: '5 min', xp: '+30 XP', route: '/speaking' },
    listening: { label: 'Complete 1 Listening Scenario', time: '5 min', xp: '+20 XP', route: '/listening' },
    reading: { label: 'Read 1 Practice Story', time: '8 min', xp: '+20 XP', route: '/reading' },
    writing: { label: 'Complete 1 Writing Task', time: '12 min', xp: '+35 XP', route: '/writing' },
    quiz: { label: 'Pass 1 Grammar Course Quiz', time: '10 min', xp: '+50 XP', route: '/grammar' }
  };

  return (
    <div className="space-y-6 select-none max-w-md mx-auto pb-10 pt-4 px-2 relative">
      
      {/* NATIVE PULL TO REFRESH */}
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent 
          pullingText="Pull down to refresh study goals..." 
          refreshingText="Updating your statistics..."
        />
      </IonRefresher>

      {/* 👋 Welcome back card */}
      <div className="text-left py-2 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-widest font-black text-indigo-400">👋 Welcome back</span>
          <h1 className="text-3xl font-black text-white mt-1">
            Hello, {user?.name || 'Learner'}!
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Let's take another small step toward English fluency today.
          </p>
        </div>
      </div>

      {/* 📅 Today's Lesson Banner */}
      <div className="p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/30 shadow-lg shadow-indigo-950/20 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <BookOpen className="w-24 h-24 text-indigo-400" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            📅 Today's Lesson
          </span>
          <h2 className="text-xl font-extrabold text-white pt-2 leading-tight">
            Day {currentDay}: {dayTopics[currentDay] || 'Daily Communication'}
          </h2>
          <p className="text-[11px] text-slate-400 leading-normal pt-1">
            Unlock greetings, grammar concept quizzes, oral vocabulary repetition and writing exercises.
          </p>
        </div>
      </div>

      {/* 🔥 Streak, ⭐ XP, and 📈 Progress Indicators */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Streak */}
        <div className="glass-card rounded-2xl p-3 border border-slate-205/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-1.5">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">Streak</span>
          <p className="text-sm font-black text-white mt-0.5">{user?.streak || 0} Days</p>
        </div>

        {/* XP */}
        <div className="glass-card rounded-2xl p-3 border border-slate-205/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1.5">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">XP Points</span>
          <p className="text-sm font-black text-white mt-0.5">{user?.xp || 0} XP</p>
        </div>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-3 border border-slate-205/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-450 mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">Progress</span>
          <p className="text-sm font-black text-emerald-400 mt-0.5">{progressPct}%</p>
        </div>
      </div>

      {/* 📈 Progress Bar representation */}
      <div className="glass-card rounded-2xl p-4 border border-slate-205/10 text-left space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
          <span>Today's Progress</span>
          <span>{completedTasks}/{totalTasks} Completed</span>
        </div>
        <div className="w-full h-3 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ▶️ Continue Learning Button */}
      <button
        onClick={handleContinueLearning}
        className="w-full py-4 bg-gradient-to-r from-indigo-650 via-purple-650 to-pink-650 active:scale-[0.99] hover:brightness-110 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-650/20 text-sm flex items-center justify-center space-x-2 animate-bounce-subtle"
      >
        <Play className="w-4.5 h-4.5 fill-current" />
        <span>Continue Learning (Day {currentDay})</span>
      </button>

      {/* 🎯 Daily Goal Interactive Cards */}
      <div className="space-y-3.5 text-left">
        <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
          <Target className="w-4.5 h-4.5 text-indigo-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-200">Daily Study Objectives</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Click Start to complete drills and earn target XP rewards</p>
          </div>
        </div>

        <div className="space-y-3">
          {checklistItems.length > 0 ? (
            checklistItems.map(([key, value]: any) => {
              const meta = goalMetadata[key] || { label: key, time: '10 min', xp: '+20 XP', route: '/' };
              const isCompleted = value.completed;
              const taskPct = Math.round((value.current / value.target) * 100);

              return (
                <div 
                  key={key} 
                  className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-4 select-none ${
                    isCompleted 
                      ? 'bg-slate-900/40 border-slate-900/60 opacity-60' 
                      : 'glass-card border-slate-205/10 glow-active'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 text-xs min-w-0">
                    {/* Circle Progress Indicator */}
                    <ProgressRingMini pct={taskPct} />

                    <div className="min-w-0">
                      <h4 className={`font-extrabold text-xs truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-250'}`}>
                        {meta.label}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{meta.time}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-indigo-400">
                          <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{meta.xp}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCompleted}
                    onClick={() => navigate(meta.route)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wide transition-all active:scale-95 shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default'
                        : 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-0.5">
                        <span>Start</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-slate-500 py-3">Loading study objectives...</div>
          )}
        </div>
      </div>

    </div>
  );
};
