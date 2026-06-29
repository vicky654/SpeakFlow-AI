import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { ArrowLeft, Coins, Sparkles, AlertCircle } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';

const PRIZES = [
  { type: 'XP', amount: 50, label: '+50 XP Bonus', color: '#6366f1' },
  { type: 'Coins', amount: 15, label: '+15 Coins', color: '#f59e0b' },
  { type: 'XP', amount: 100, label: 'Super Jackpot (+100 XP)', color: '#a855f7' },
  { type: 'Coins', amount: 5, label: '+5 Coins', color: '#10b981' },
  { type: 'Coins', amount: 30, label: 'Jackpot (+30 Coins)', color: '#ec4899' },
  { type: 'XP', amount: 20, label: '+20 XP', color: '#3b82f6' }
];

export const LuckySpin: React.FC = () => {
  const { progress, fetchProgress, rollLuckySpin } = useChallengeStore();
  const navigate = useNavigate();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  
  const controls = useAnimation();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleSpinWheel = async () => {
    if (isSpinning) return;
    
    // API trigger
    const res = await rollLuckySpin();
    if (!res) return;

    setIsSpinning(true);
    setResultMessage(null);

    // Calculate rotation angle matching selected index
    const selectedPrizeLabel = res.prize.label;
    const selectedIndex = PRIZES.findIndex(p => p.label === selectedPrizeLabel);
    const indexOffset = selectedIndex !== -1 ? selectedIndex : 0;
    
    // Each segment is 60 degrees. Spin 5 full rotations + offset angle
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 3600 - (indexOffset * segmentAngle) - (segmentAngle / 2);

    await controls.start({
      rotate: targetAngle,
      transition: { duration: 4.5, ease: 'easeOut' }
    });

    setIsSpinning(false);
    setResultMessage(`Congratulations! You won: ${res.prize.label}! 🎉`);
    
    // Confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Refresh states
    await fetchProgress();
  };

  const spinsLeft = progress?.luckySpinsLeftToday ?? 1;

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <button
          onClick={() => navigate('/challenge')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Timeline Path</span>
        </button>
        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
          Lucky Wheel
        </span>
      </div>

      {/* REWARDS STATS */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200/10 flex items-center justify-between text-xs font-bold text-slate-350">
        <span>Lucky Spins left today: <span className="text-indigo-400 font-mono font-bold">{spinsLeft}</span></span>
        <div className="flex items-center space-x-1.5">
          <Coins className="w-4 h-4 text-amber-500 fill-current" />
          <span>{progress?.coinsEarned || 0} Coins</span>
        </div>
      </div>

      {/* WHEEL CONTAINER */}
      <div className="flex flex-col items-center justify-center space-y-6 pt-4 relative">
        {/* Pointer */}
        <div className="absolute top-2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-indigo-500 z-20 filter drop-shadow-md" />

        {/* Wheel circle */}
        <div className="w-64 h-64 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center relative overflow-hidden shadow-xl shadow-indigo-650/10">
          <motion.div
            className="w-full h-full relative"
            animate={controls}
            initial={{ rotate: 0 }}
          >
            {PRIZES.map((prize, idx) => {
              const rotateAngle = idx * 60;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full origin-center flex flex-col items-center pt-4"
                  style={{
                    transform: `rotate(${rotateAngle}deg)`
                  }}
                >
                  {/* segment line divider mock styling */}
                  <div 
                    className="w-0.5 h-1/2 bg-slate-900 absolute left-1/2 -translate-x-1/2 top-0"
                    style={{ transform: `rotate(30deg)` }}
                  />
                  <div className="z-10 text-center select-none pt-4">
                    <span className="text-[10px] font-black uppercase text-white drop-shadow block" style={{ color: prize.color }}>
                      {prize.type}
                    </span>
                    <span className="text-[8px] text-slate-350 font-bold block">
                      {prize.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
          {/* Inner small peg */}
          <div className="absolute w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 z-20 shadow-md" />
        </div>

        {/* SPIN BUTTON */}
        <button
          disabled={isSpinning}
          onClick={handleSpinWheel}
          className="w-48 py-3 bg-indigo-600 active:bg-indigo-550 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-650/20 disabled:opacity-40"
        >
          {isSpinning ? 'Rolling Reward...' : spinsLeft > 0 ? 'Spin (Free Today!)' : 'Spin (Cost: 10 Coins)'}
        </button>

        {resultMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs text-emerald-400 font-semibold animate-pulse text-center max-w-xs leading-normal">
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};
