import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useChallengeStore } from '../store/challengeStore';
import { Flame, Sparkles, Target, Play, CheckCircle2, Circle, Award, BookOpen } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const { progress, fetchProgress } = useChallengeStore();
  const navigate = useNavigate();

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

  // Calculate Progress Percent
  const checklist = dailyChallenge?.checklist || {};
  const checklistItems = Object.entries(checklist);
  const totalTasks = checklistItems.length || 6;
  const completedTasks = checklistItems.filter(([_, v]: any) => v.completed).length;
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  const labelMap: Record<string, string> = {
    vocab: 'Learn 10 Vocabulary Words',
    speaking: 'Complete 1 Speaking Drill',
    reading: 'Read 1 Practice Story',
    listening: 'Complete 1 Listening Scenario',
    writing: 'Complete 1 Writing Task',
    quiz: 'Pass 1 Grammar Course Quiz'
  };

  return (
    <div className="space-y-6 select-none max-w-md mx-auto pb-10 pt-4 px-2">
      
      {/* 👋 Welcome back card */}
      <div className="text-left py-2">
        <span className="text-xs uppercase tracking-widest font-black text-indigo-400">👋 Welcome back</span>
        <h1 className="text-3xl font-black text-white mt-1">
          Hello, {user?.name || 'Learner'}!
        </h1>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Let's take another small step toward English fluency today.
        </p>
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
            Unlock Greetings, grammar concept quizzes, oral vocabulary repetition and writing exercises.
          </p>
        </div>
      </div>

      {/* 🔥 Streak, ⭐ XP, and 📈 Progress Indicators in a 3-way card row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Streak */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-1.5">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">Streak</span>
          <p className="text-sm font-black text-white mt-0.5">{user?.streak || 0} Days</p>
        </div>

        {/* XP */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-1.5">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">XP Points</span>
          <p className="text-sm font-black text-white mt-0.5">{user?.xp || 0} XP</p>
        </div>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-3 border border-slate-200/10 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-450 mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[9px] text-slate-500 uppercase font-extrabold">Progress</span>
          <p className="text-sm font-black text-emerald-400 mt-0.5">{progressPct}%</p>
        </div>
      </div>

      {/* 📈 Progress Bar representation */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/10 text-left space-y-1.5">
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
        className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-650 to-pink-650 active:scale-[0.99] hover:brightness-110 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-indigo-650/20 text-sm flex items-center justify-center space-x-2 animate-bounce-subtle"
      >
        <Play className="w-4.5 h-4.5 fill-current" />
        <span>Continue Learning (Day {currentDay})</span>
      </button>

      {/* 🎯 Daily Goal Checklist */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 text-left space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-905 pb-3">
          <Target className="w-4.5 h-4.5 text-indigo-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-200">Today's Daily Goal</h3>
            <p className="text-[10px] text-slate-550 mt-0.5">Finish these simple checks to earn bonus rewards</p>
          </div>
        </div>

        <div className="space-y-2">
          {checklistItems.length > 0 ? (
            checklistItems.map(([key, value]: any) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900">
                <div className="flex items-center space-x-3 text-xs">
                  {value.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-555/5 shrink-0" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-slate-700 shrink-0" />
                  )}
                  <span className={value.completed ? 'text-slate-500 line-through' : 'text-slate-200 font-semibold'}>
                    {labelMap[key] || key}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                  {value.current}/{value.target}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-500 py-3">Loading your goals...</div>
          )}
        </div>
      </div>

    </div>
  );
};
