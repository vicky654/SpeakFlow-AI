import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useChallengeStore } from '../store/challengeStore';
import { BookOpen, Flame, Star, Play } from 'lucide-react';

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

  // Get greeting based on current local hours
  const getGreetingTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate Progress Percent based on daily steps
  const checklist = dailyChallenge?.checklist || {};
  const checklistItems = Object.entries(checklist);
  const totalTasks = checklistItems.length || 6;
  const completedTasks = checklistItems.filter(([_, v]: any) => v.completed).length;
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-7 select-none max-w-md mx-auto pb-12 pt-4 px-1 text-brand-text-primary">
      
      {/* 👋 Personalized Greeting */}
      <div className="text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-brand-text-primary">
          👋 {getGreetingTime()}, {user?.name || 'Learner'}
        </h1>
        <p className="text-xs text-brand-text-secondary">Ready for another simple step today?</p>
      </div>

      {/* 📅 Challenge Day Tracker Banner */}
      <div className="flex items-center justify-between text-xs font-semibold text-brand-text-secondary tracking-wide uppercase bg-brand-surface border border-brand-border px-4 py-2 rounded-xl">
        <span>Curriculum Status</span>
        <span className="text-brand-primary font-bold">Day {currentDay} of 15</span>
      </div>

      {/* 📖 Headway-Style Today's Lesson CTA Box */}
      <div className="card space-y-5">
        <div className="flex justify-between items-center border-b border-brand-border pb-3.5">
          <div className="flex items-center space-x-2 text-brand-primary">
            <BookOpen className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-text-secondary">Today's Lesson</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-bg text-brand-text-secondary border border-brand-border">
            15 min
          </span>
        </div>

        <div className="text-left space-y-1.5">
          <h2 className="text-lg font-bold text-brand-text-primary leading-tight">
            Day {currentDay}: {dayTopics[currentDay] || 'Daily Communication'}
          </h2>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            Covers vocabulary review, native speech patterns, interactive story quizzes, and sentence writing exercises.
          </p>
        </div>

        <div className="pt-1.5">
          <button
            onClick={handleContinueLearning}
            style={{ borderRadius: '12px', padding: '14px' }}
            className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>Continue Learning</span>
          </button>
        </div>
      </div>

      {/* 📊 Today's Progress Bar indicator */}
      <div className="card space-y-3.5 text-left">
        <div className="flex justify-between items-center text-[10px] text-brand-text-secondary font-semibold uppercase tracking-wider">
          <span>Today's Progress</span>
          <span className="text-indigo-600 font-bold">{progressPct}%</span>
        </div>
        
        {/* Custom Progress Bar */}
        <div className="w-full h-3 bg-brand-bg border border-brand-border rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 🔥/⭐ Simple Footer Stats Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card !p-4 flex items-center justify-center space-x-2 border-brand-border bg-gray-50/50">
          <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse shrink-0" />
          <span className="text-xs font-bold text-brand-text-secondary">{user?.streak || 0} Day Streak</span>
        </div>

        <div className="card !p-4 flex items-center justify-center space-x-2 border-brand-border bg-gray-50/50">
          <Star className="w-5 h-5 text-indigo-500 fill-indigo-500/10 shrink-0" />
          <span className="text-xs font-bold text-brand-text-secondary">{user?.xp || 0} XP Points</span>
        </div>
      </div>

    </div>
  );
};
