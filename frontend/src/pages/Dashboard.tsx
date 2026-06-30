import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useChallengeStore } from '../store/challengeStore';
import {
  Flame, Sparkles, Target, Play, CheckCircle2, ChevronRight, Award,
  BookOpen, Clock, Zap, MessageCircle, Headphones, Mic, Book, PenTool, GraduationCap, Coins
} from 'lucide-react';
import { IonRefresher, IonRefresherContent } from '@ionic/react';
import { Button } from '../components/Button';

// Inline Mini SVG Progress Ring formatted for premium center text layout
const ProgressRingMini: React.FC<{ pct: number }> = ({ pct }) => {
  const radius = 16;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="var(--color-border)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--color-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span className="absolute text-[8px] font-bold text-brand-text-primary">{pct}%</span>
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

  const goalMetadata: Record<string, { label: string; time: string; xp: string; route: string }> = {
    vocab: { label: 'Vocabulary Flashcards', time: '10 min', xp: '+25 XP', route: '/vocab' },
    speaking: { label: 'Speaking Challenges', time: '5 min', xp: '+30 XP', route: '/speaking' },
    listening: { label: 'Listening Scenarios', time: '5 min', xp: '+20 XP', route: '/listening' },
    reading: { label: 'Reading Stories', time: '8 min', xp: '+20 XP', route: '/reading' },
    writing: { label: 'Writing Practices', time: '12 min', xp: '+35 XP', route: '/writing' },
    quiz: { label: 'Grammar Course Quiz', time: '10 min', xp: '+50 XP', route: '/grammar' }
  };




  return (
    <div className="space-y-6 select-none max-w-md mx-auto pb-12 pt-2 px-1 text-brand-text-primary">

      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingText="Pull down to refresh study goals..."
          refreshingText="Updating your statistics..."
        />
      </IonRefresher>

      {/* 👋 Welcome Header */}
      <div className="text-left py-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-primary">👋 Welcome back</span>
        <h1 className="text-2xl font-bold tracking-tight text-brand-text-primary mt-0.5">
          Hello, {user?.name || 'Learner'}!
        </h1>
        <p className="text-xs text-brand-text-secondary mt-1 leading-normal font-normal">
          Let's take another small step toward English fluency today.
        </p>
      </div>

      {/* 📅 Today's Lesson Hero Gradient Card */}
      <div className="p-6 rounded-[24px] bg-gradient-to-br from-brand-primary to-[#8B5CF6] shadow-md relative overflow-hidden text-left border border-white/5 text-white">
        <div className="absolute -right-6 -bottom-6 p-4 opacity-10 pointer-events-none">
          <BookOpen className="w-32 h-32 text-white" />
        </div>

        <div className="space-y-4 relative z-10">
          <span className="inline-block text-[9px] uppercase tracking-wider font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            📅 Today's Lesson
          </span>
          <div>
            <h2 className="text-xl font-bold leading-snug text-white">
              Day {currentDay}: {dayTopics[currentDay] || 'Daily Communication'}
            </h2>
            <p className="text-xs text-white/85 leading-relaxed pt-1.5 max-w-[85%] font-normal">
              Unlock conversational greetings, grammar quizzes, audio repetitions, and interactive writing drills.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleContinueLearning}
              style={{ borderRadius: '999px', padding: '10px 22px' }}
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Start Learning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <div className="card !p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <span className="text-[10px] text-brand-text-secondary uppercase font-semibold tracking-wide">Streak</span>
          <p className="text-sm font-extrabold text-brand-text-primary mt-0.5">{user?.streak || 0} Days</p>
        </div>

        {/* XP */}
        <div className="card !p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-2">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] text-brand-text-secondary uppercase font-semibold tracking-wide">XP</span>
          <p className="text-sm font-extrabold text-brand-text-primary mt-0.5">{user?.xp || 0}</p>
        </div>

        {/* Coins */}
        <div className="card !p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-2">
            <Coins className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] text-brand-text-secondary uppercase font-semibold tracking-wide">Coins</span>
          <p className="text-sm font-extrabold text-brand-text-primary mt-0.5">{user?.coins || 0}</p>
        </div>
      </div>

      {/* 🏆 Recent Achievement */}
      <div className="card flex items-center justify-between gap-4 p-4.5 bg-gradient-to-br from-amber-500/5 to-orange-500/10 border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Recent Achievement</span>
            <h4 className="text-xs font-extrabold text-brand-text-primary mt-0.5">Welcome Onboard!</h4>
            <p className="text-[10px] text-brand-text-secondary leading-none">You've unlocked Day {currentDay} of the guided challenge</p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-bold">
          Active
        </span>
      </div>

      {/* Progress Track */}
      <div className="card !p-5 text-left space-y-3">
        <div className="flex justify-between items-center text-[10px] text-brand-text-secondary font-semibold uppercase tracking-wider">
          <span>Today's Progress</span>
          <span className="text-brand-success font-bold">{completedTasks}/{totalTasks} Completed</span>
        </div>
        <div className="w-full h-3 bg-brand-bg border border-brand-border rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>



      {/* 🎯 Daily Goals Checklist */}
      <div className="space-y-4 text-left pt-2">
        <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
          <Target className="w-4.5 h-4.5 text-brand-primary" />
          <div>
            <h3 className="font-bold text-sm text-brand-text-primary">Daily Study Objectives</h3>
            <p className="text-[10px] text-brand-text-secondary mt-0.5 font-normal">Complete checklist items to maximize XP reward metrics</p>
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
                  className={`card transition-all flex items-center justify-between gap-4 select-none ${
                    isCompleted ? 'opacity-50' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <ProgressRingMini pct={taskPct} />

                    <div className="min-w-0 space-y-1">
                      <h4 className={`font-bold text-xs sm:text-sm leading-tight ${isCompleted ? 'text-brand-text-muted line-through' : 'text-brand-text-primary'}`}>
                        {meta.label}
                      </h4>
                      <div className="flex items-center space-x-3 text-[10px] text-brand-text-secondary font-semibold">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
                          <span>{meta.time}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-brand-primary">
                          <Zap className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                          <span>{meta.xp}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCompleted}
                    onClick={() => navigate(meta.route)}
                    style={{ borderRadius: '999px', padding: '8px 18px' }}
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${
                      isCompleted
                        ? 'bg-green-100 text-green-600 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <span>Start</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
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
