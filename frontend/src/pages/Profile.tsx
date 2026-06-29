import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { User, Award, Flame, Coins, Sparkles, BookOpen, CheckCircle, Trophy, Printer } from 'lucide-react';

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const { badges, fetchBadges } = useLearningStore();

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const totalLessonsCount = user?.completedLessons.length || 0;
  const isEligibleForCertificate = totalLessonsCount >= 3 || (user?.level && user.level >= 2);

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <User className="w-8 h-8 text-indigo-400" />
          <span>My Learning Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review earned credentials, unlock gamification badges, and generate completion certificates.</p>
      </div>

      {/* USER HEADER CARD */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-indigo-950/20 via-slate-900/60 to-purple-950/15">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg shadow-indigo-600/10">
          {user?.name.charAt(0) || 'S'}
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] uppercase font-bold tracking-wider w-max mx-auto sm:mx-0">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400">Account registered at: {user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start space-x-4 pt-1 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500 fill-current" />
              <span>{user?.streak} Day Streak</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="w-4 h-4 text-amber-500 fill-current" />
              <span>{user?.coins} Coins</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Lvl {user?.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE SPLIT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BADGES GALLERY BOARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-extrabold text-lg text-slate-200">Achievement Badges</h3>
            <p className="text-xs text-slate-400">Complete tasks across writing, speaking, and vocab to unlock credentials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3.5 rounded-2xl border flex items-center space-x-3.5 transition-all ${
                  b.earned
                    ? 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                    : 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <span className={`text-2xl ${b.earned ? 'animate-bounce' : 'grayscale'}`}>{b.icon}</span>
                <div className="text-left space-y-0.5">
                  <h4 className={`text-xs font-extrabold ${b.earned ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {b.title}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-slate-400 line-clamp-2">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CERTIFICATE WIDGET BOARD */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-slate-200">English Completion Certificate</h3>
            <p className="text-xs text-slate-400">
              Unlock a printable SpeakFlow AI certificate by finishing at least 3 lesson units.
            </p>
          </div>

          {isEligibleForCertificate ? (
            /* CERTIFICATE PREVIEW PANEL */
            <div className="p-5 bg-gradient-to-tr from-amber-950/20 via-slate-900/60 to-amber-950/15 border-2 border-dashed border-amber-500/40 rounded-2xl space-y-4 text-center relative overflow-hidden select-none">
              <div className="absolute top-2 right-2 text-2xl opacity-20">📜</div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-mono text-amber-500 font-bold">Certificate of Merit</span>
                <h4 className="text-sm font-extrabold text-slate-100">{user?.name}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed px-4">
                  For outstanding dedication in completing introductory grammar modules, speaking drills, and reading reviews on the SpeakFlow AI platform.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[9px] font-semibold text-slate-500">
                <span>Award Date: {new Date().toLocaleDateString()}</span>
                <span className="text-amber-500 font-bold">Authorized by SpeakFlow AI</span>
              </div>
            </div>
          ) : (
            /* LOCK PANEL */
            <div className="p-6 bg-slate-950/60 border border-slate-900 rounded-2xl text-center space-y-3 flex flex-col items-center">
              <span className="text-3xl opacity-35">🔒</span>
              <h4 className="text-xs font-bold text-slate-400">Certificate Locked</h4>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                You have completed <span className="text-indigo-400 font-bold">{totalLessonsCount} / 3</span> lessons required to unlock. Finish more grammar or reading scenarios to generate it!
              </p>
            </div>
          )}

          {isEligibleForCertificate && (
            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/25 flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
