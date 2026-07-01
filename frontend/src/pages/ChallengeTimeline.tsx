import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore, IDayStatus } from '../store/challengeStore';
import { Flame, Coins, Sparkles, Trophy, Lock, Play, CheckCircle2, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChallengeTimeline: React.FC = () => {
  const { progress, fetchProgress, claimDailyChest } = useChallengeStore();
  const navigate = useNavigate();
  const [chestMessage, setChestMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleClaimChest = async () => {
    const res = await claimDailyChest();
    if (res) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setChestMessage('You unlocked the Daily Chest! Earned +50 XP and +20 Coins! 🎉');
      setTimeout(() => setChestMessage(null), 5000);
    }
  };

  const handleNodeClick = (dayNumber: number, status: string) => {
    if (status === 'locked') {
      alert('This day is locked. Finish the previous challenge day to unlock.');
      return;
    }
    navigate(`/challenge/day/${dayNumber}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const canClaimChest = progress && progress.lastClaimedDailyChest !== today;

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">15-Day Master Challenge</h2>
        <p className="text-xs text-brand-text-secondary">Complete curriculum blocks sequentially to unlock fluency credentials.</p>
      </div>

      {/* STATS OVERVIEW CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border bg-gradient-to-r from-indigo-950/20 via-slate-900/60 to-purple-950/15 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-500/15 rounded-2xl text-indigo-405 shrink-0">
            <Trophy className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm text-brand-text-primary">Overall Progress</h3>
            <p className="text-xs text-brand-text-secondary font-bold">
              {progress ? Math.round((progress.completedDays.length / 15) * 100) : 0}% Complete
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs font-bold text-slate-350">
          <div className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-orange-500 fill-current animate-pulse" />
            <span>{progress?.longestStreak || 0} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4 text-amber-500 fill-current" />
            <span>{progress?.coinsEarned || 0}</span>
          </div>
        </div>
      </div>

      {/* DAILY CHEST CLAIM */}
      {progress && (
        <div className={`p-4 rounded-3xl border flex flex-col justify-between items-center text-center space-y-3.5 transition-all ${
          canClaimChest 
            ? 'bg-indigo-950/20 border-indigo-500/30 text-brand-text-primary' 
            : 'bg-brand-bg/30 border-brand-border text-brand-text-muted opacity-60'
        }`}>
          <div className="flex flex-col items-center space-y-1">
            <Gift className={`w-8 h-8 ${canClaimChest ? 'text-indigo-400 animate-bounce' : 'text-brand-text-muted'}`} />
            <h4 className="font-extrabold text-xs text-brand-text-primary">Daily Treasure Chest</h4>
            <p className="text-[10px] text-slate-405 leading-normal">
              {canClaimChest ? 'Claim +50 XP and +20 Coins daily reward bonus!' : 'Already claimed today. Chest resets tomorrow!'}
            </p>
          </div>
          {canClaimChest && (
            <button
              onClick={handleClaimChest}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Unlock Treasure Chest
            </button>
          )}
        </div>
      )}

      {chestMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-center text-xs text-emerald-400 font-semibold animate-pulse">
          {chestMessage}
        </div>
      )}

      {/* LUCKY SPIN MINI LINK */}
      <div 
        onClick={() => navigate('/lucky-spin')}
        className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 cursor-pointer hover:border-brand-primary/45 active:scale-[0.99] transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">🎡</span>
          <div className="text-left">
            <h4 className="font-extrabold text-xs text-brand-text-primary">Lucky Spin Wheel</h4>
            <p className="text-[10px] text-brand-text-muted leading-normal">Roll the wheel to win XP multipliers, badges, or coins.</p>
          </div>
        </div>
        <span className="text-[10px] text-indigo-400 font-extrabold font-mono uppercase">Spin →</span>
      </div>

      {/* TIMELINE PATH (SEQUENTIAL NODES) */}
      <div className="space-y-4 relative pl-8 border-l border-brand-border my-4 ml-6 pt-2">
        {Array.from({ length: 15 }).map((_, idx) => {
          const dayNumber = idx + 1;
          
          // Determine status
          let status: 'locked' | 'completed' | 'current' = 'locked';
          if (progress) {
            const statusObj = progress.dailyStatus[dayNumber];
            if (statusObj) {
              status = statusObj.status as 'locked' | 'completed' | 'current';
            } else if (dayNumber === 1) {
              status = 'current';
            }
          } else if (dayNumber === 1) {
            status = 'current';
          }

          let nodeClass = 'bg-brand-bg border-brand-border text-slate-650';
          let ringClass = 'border-transparent';

          if (status === 'completed') {
            nodeClass = 'bg-emerald-600/15 border-emerald-500 text-emerald-400';
          } else if (status === 'current') {
            nodeClass = 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105';
            ringClass = 'border-indigo-500/30 animate-ping';
          }

          return (
            <div key={dayNumber} className="relative mb-6">
              {/* Outer Pulsing Ring for Current Node */}
              {status === 'current' && (
                <div className={`absolute -left-[45px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 ${ringClass}`} />
              )}

              {/* Node Circle */}
              <button
                onClick={() => handleNodeClick(dayNumber, status)}
                className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${nodeClass}`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                ) : status === 'locked' ? (
                  <Lock className="w-3.5 h-3.5 text-brand-text-muted" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white ml-0.5 fill-current" />
                )}
              </button>

              {/* Node Details Description */}
              <div className="pl-4 text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-text-muted">Day {dayNumber}</span>
                <h4 className={`font-extrabold text-xs ${status === 'locked' ? 'text-brand-text-muted opacity-60' : 'text-brand-text-primary'}`}>
                  {dayNumber === 1 ? 'Buy Groceries at the Local Store' :
                   dayNumber === 2 ? 'Book a Room at the Grand Hotel' :
                   dayNumber === 3 ? 'Attend a Professional Job Interview' :
                   dayNumber === 4 ? 'Board a Flight at the Airport Terminal' :
                   dayNumber === 5 ? 'Order Lunch at the Prime Bistro Restaurant' :
                   dayNumber === 6 ? 'Ask for Directions to the Train Station' :
                   dayNumber === 7 ? 'Register a New Account at the National Bank' :
                   dayNumber === 8 ? 'Explain Health Symptoms to the Medical Doctor' :
                   dayNumber === 9 ? 'Report a Lost Item at the City Police Station' :
                   dayNumber === 10 ? 'Introduce Friends at a Social Gathering' :
                   dayNumber === 11 ? 'Lead a Project Review Office Meeting' :
                   dayNumber === 12 ? 'Schedule a Phone Call Appointment' :
                   dayNumber === 13 ? 'Describe Travel Plans for Summer Vacation' :
                   dayNumber === 14 ? 'Buy Clothes at the Shopping Mall Boutique' :
                   'Deliver a Speech at the Graduation Ceremony'}
                </h4>
                <p className="text-[10px] text-brand-text-muted leading-normal mt-0.5">
                  {status === 'completed' ? 'Challenge Day Fully Completed • 100%' :
                   status === 'current' ? 'Available. Click to start practice modules' :
                   'Prerequisite: complete previous days to unlock'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
