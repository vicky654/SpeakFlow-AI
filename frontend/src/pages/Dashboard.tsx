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
    <div className="space-y-6 select-none max-w-md mx-auto pb-10 pt-4 px-2 text-brand-text-primary font-sans">
      
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
          <span className="text-xs uppercase tracking-widest font-semibold text-brand-primary">👋 Welcome back</span>
          <h1 className="text-2xl font-semibold text-brand-text-primary mt-1">
            Hello, {user?.name || 'Learner'}!
          </h1>
          <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed font-normal">
            Let's take another small step toward English fluency today.
          </p>
        </div>
      </div>

      {/* 📅 Today's Lesson Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-primary via-indigo-650 to-brand-accent shadow-level-2 relative overflow-hidden text-left border border-white/10 select-none text-white">
        <div className="absolute -right-6 -bottom-6 p-4 opacity-15 pointer-events-none">
          <BookOpen className="w-32 h-32 text-white" />
        </div>
        <div className="space-y-3 relative z-10">
          <span className="inline-block text-[9px] uppercase tracking-widest font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            📅 Today's Lesson
          </span>
          <div>
            <h2 className="text-xl font-semibold leading-tight text-white">
              Day {currentDay}: {dayTopics[currentDay] || 'Daily Communication'}
            </h2>
            <p className="text-xs text-white/80 leading-relaxed pt-1.5 max-w-[85%] font-normal">
              Unlock conversational greetings, grammar quizzes, audio repetitions, and interactive writing drills.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleContinueLearning}
              className="px-5 py-2.5 bg-white text-brand-primary hover:bg-slate-50 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Learning</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 Streak, ⭐ XP, and 📈 Progress Indicators */}
      <div className="grid grid-cols-3 gap-3 select-none">
        {/* Current Streak */}
        <div className="bg-brand-card rounded-2xl p-3 border border-brand-border flex flex-col items-center justify-center text-center shadow-level-1">
          <div className="w-9 h-9 rounded-xl bg-brand-error/10 flex items-center justify-center text-brand-error mb-1.5">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <span className="text-[10px] text-brand-text-muted uppercase font-medium tracking-wide">Streak</span>
          <p className="text-base font-semibold text-brand-text-primary mt-0.5">{user?.streak || 0} Days</p>
        </div>

        {/* XP */}
        <div className="bg-brand-card rounded-2xl p-3 border border-brand-border flex flex-col items-center justify-center text-center shadow-level-1">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-1.5">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[10px] text-brand-text-muted uppercase font-medium tracking-wide">XP Points</span>
          <p className="text-base font-semibold text-brand-text-primary mt-0.5">{user?.xp || 0}</p>
        </div>

        {/* Progress */}
        <div className="bg-brand-card rounded-2xl p-3 border border-brand-border flex flex-col items-center justify-center text-center shadow-level-1">
          <div className="w-9 h-9 rounded-xl bg-brand-success/10 flex items-center justify-center text-brand-success mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-brand-text-muted uppercase font-medium tracking-wide">Progress</span>
          <p className="text-base font-semibold text-brand-success mt-0.5">{progressPct}%</p>
        </div>
      </div>

      {/* 📈 Progress Bar representation */}
      <div className="bg-brand-card rounded-2xl p-4.5 border border-brand-border text-left shadow-level-1">
        <div className="flex justify-between items-center text-[10px] text-brand-text-muted font-medium uppercase tracking-wider mb-2">
          <span>Today's Progress</span>
          <span className="text-brand-success font-semibold">{completedTasks}/{totalTasks} Completed</span>
        </div>
        <div className="w-full h-2.5 bg-brand-bg border border-brand-border rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 🎯 Daily Goal Interactive Cards */}
      <div className="space-y-3.5 text-left">
        <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
          <Target className="w-4.5 h-4.5 text-brand-primary" />
          <div>
            <h3 className="font-semibold text-sm text-brand-text-primary">Daily Study Objectives</h3>
            <p className="text-[10px] text-brand-text-secondary mt-0.5 font-normal">Click Start to complete drills and earn target XP rewards</p>
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
                  className={`p-4.5 rounded-2xl border transition-all flex items-center justify-between gap-4 select-none ${
                    isCompleted 
                      ? 'bg-brand-surface/40 border-brand-border opacity-55 shadow-sm' 
                      : 'bg-brand-card border-brand-border hover:shadow-level-2 shadow-level-1'
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    {/* Circle Progress Indicator */}
                    <ProgressRingMini pct={taskPct} />

                    <div className="min-w-0">
                      <h4 className={`font-semibold text-sm ${isCompleted ? 'text-brand-text-muted line-through' : 'text-brand-text-primary'} leading-snug`}>
                        {meta.label}
                      </h4>
                      <div className="flex items-center space-x-3.5 mt-1 text-[10px] text-brand-text-secondary font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
                          <span>{meta.time}</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-brand-primary">
                          <Zap className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          <span>{meta.xp}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCompleted}
                    onClick={() => navigate(meta.route)}
                    className={`px-4.5 h-9 flex items-center justify-center rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                      isCompleted
                        ? 'bg-brand-success/15 border border-brand-success/20 text-brand-success cursor-default space-x-1.5'
                        : 'bg-brand-primary hover:bg-brand-hover text-white shadow-sm'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                        <span>Done</span>
                      </>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <span>Start</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-brand-text-muted py-3">Loading study objectives...</div>
          )}
        </div>
      </div>

    </div>
  );
};
