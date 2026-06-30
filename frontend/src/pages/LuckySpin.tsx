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
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <button
          onClick={() => navigate('/challenge')}
          className="flex items-center space-x-1.5 text-xs text-brand-text-secondary hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Timeline Path</span>
        </button>
        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25">
          Lucky Wheel
        </span>
      </div>

      {/* REWARDS STATS */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-4 flex items-center justify-between text-xs font-medium text-brand-text-secondary">
        <span>Lucky Spins left today: <span className="text-indigo-400 font-mono font-bold">{spinsLeft}</span></span>
        <div className="flex items-center space-x-1.5">
          <Coins className="w-4 h-4 text-amber-500 fill-current" />
          <span>{progress?.coinsEarned || 0} Coins</span>
        </div>
      </div>

      {/* WHEEL CONTAINER */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-6 flex flex-col items-center justify-center space-y-6 pt-8 relative max-w-sm mx-auto select-none">
        {/* Pointer */}
        <div className="absolute top-4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-brand-primary z-20 filter drop-shadow-md" />

        {/* Wheel circle wrapper with bounce layout controls */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-64 h-64 rounded-full border-4 border-brand-border bg-brand-bg flex items-center justify-center relative overflow-hidden shadow-level-2"
        >
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
                    className="w-0.5 h-1/2 bg-brand-border absolute left-1/2 -translate-x-1/2 top-0"
                    style={{ transform: `rotate(30deg)` }}
                  />
                  <div className="z-10 text-center select-none pt-4">
                    <span className="text-[10px] font-semibold uppercase text-white drop-shadow block" style={{ color: prize.color }}>
                      {prize.type}
                    </span>
                    <span className="text-[8px] text-brand-text-muted font-semibold block">
                      {prize.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
          {/* Inner small peg */}
          <div className="absolute w-8 h-8 rounded-full bg-brand-surface border-2 border-brand-border z-20 shadow-md" />
        </motion.div>

        {/* SPIN BUTTON */}
        <button
          disabled={isSpinning}
          onClick={handleSpinWheel}
          className="px-6 min-h-[50px] bg-brand-primary hover:opacity-95 text-white rounded-[14px] text-sm font-semibold transition-all shadow-level-2 disabled:opacity-40 flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
        >
          {isSpinning ? 'Rolling Reward...' : spinsLeft > 0 ? 'Spin (Free Today!)' : 'Spin (Cost: 10 Coins)'}
        </button>

        {resultMessage && (
          <div className="p-3.5 bg-brand-success/15 border border-brand-success/20 rounded-2xl text-xs text-brand-success font-semibold animate-pulse text-center max-w-xs leading-normal">
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};
