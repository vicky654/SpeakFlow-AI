import React, { useState, useRef } from 'react';
import { Word } from '../types';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { Volume2, Star, CheckCircle2, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface WordCardProps {
  word: Word;
  isLearned: boolean;
  onLearned?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isFirstCard?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  isLearned, 
  onLearned,
  onNext,
  onPrev,
  isFirstCard = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const favorites = useAuthStore(state => state.user?.favorites || []);
  const learnWord = useLearningStore(state => state.learnWord);

  const isFavorited = favorites.includes(word._id);
  const longPressTimeout = useRef<any>(null);

  // Drag visual motion variables
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-8, 8]);
  const dragShadow = useTransform(x, [-100, 0, 100], [
    '0 12px 30px rgba(15,23,42,0.15)',
    '0 4px 12px rgba(15,23,42,0.05)',
    '0 12px 30px rgba(15,23,42,0.15)'
  ]);

  // Web Speech Pronunciation
  const playSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSpeech();
  };

  const handleLearnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    learnWord(word._id);
    if (onLearned) onLearned();
  };

  // Double-tap & single-tap handler
  const handleCardTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double Tap: Bookmark favorite
      toggleFavorite(word._id);
    } else {
      // Single Tap: Flip card
      setIsFlipped(!isFlipped);
    }
    setLastTap(now);
  };

  // Drag Gesture Handlers
  const handleDragEnd = (event: any, info: any) => {
    const SWIPE_THRESHOLD = 80;
    if (info.offset.x < -SWIPE_THRESHOLD) {
      if (onNext) onNext();
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      if (onPrev) onPrev();
    }
    // Automatically reset isFlipped state when changing cards
    setIsFlipped(false);
  };

  // Long press timer controls
  const handlePressStart = () => {
    longPressTimeout.current = setTimeout(() => {
      playSpeech();
    }, 600); // 600ms long press threshold
  };

  const handlePressEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };

  return (
    <div className="relative w-full max-w-sm flex flex-col items-center">
      
      {/* Dynamic swipe hints overlay */}
      {isFirstCard && (
        <span className="text-[10px] text-brand-primary font-semibold tracking-wider uppercase mb-2 animate-bounce">
          ← Swipe card to change words →
        </span>
      )}

      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate, boxShadow: dragShadow }}
        onDragEnd={handleDragEnd}
        onDragStart={handlePressEnd}
        onClick={handleCardTap}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="w-full h-[390px] flip-card cursor-pointer select-none group relative rounded-[20px]"
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className={`relative w-full h-full flip-card-inner rounded-[20px] bg-brand-card border border-brand-border transition-all duration-500 shadow-level-1 ${isFlipped ? 'flip-card-flipped' : ''}`}>
          
          {/* CARD FRONT */}
          <div className="absolute inset-0 w-full h-full flip-card-front p-6 flex flex-col justify-between rounded-[20px] bg-brand-surface border border-brand-border">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/15">
                {word.partOfSpeech}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(word._id);
                }}
                className={`p-2 rounded-full border transition-all active:scale-90 flex items-center justify-center ${
                  isFavorited 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                    : 'bg-brand-surface border-brand-border text-brand-text-secondary hover:text-brand-primary'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Main Word */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
              <h2 className="text-3xl font-semibold tracking-tight text-brand-text-primary">
                {word.word}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-brand-text-secondary font-mono text-xs">{word.pronunciation}</span>
                <button 
                  onClick={handleSpeakWord}
                  className="p-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/15 text-brand-primary active:scale-95 transition-all flex items-center justify-center"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="pt-2">
                <span className="text-[9px] text-brand-text-muted uppercase tracking-wider font-semibold">Hindi Meaning</span>
                <p className="text-xl font-semibold text-brand-text-primary mt-0.5">{word.hindiMeaning}</p>
              </div>
            </div>

            {/* Bottom Flip Indicator */}
            <div className="flex justify-between items-center text-[10px] text-brand-text-muted border-t border-brand-border pt-3">
              <div className="flex items-center space-x-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-brand-primary" />
                <span>Tap card to flip</span>
              </div>
              <span className="font-semibold text-brand-text-muted">English meanings →</span>
            </div>
          </div>

          {/* CARD BACK */}
          <div className="absolute inset-0 w-full h-full flip-card-back p-6 flex flex-col justify-between overflow-y-auto rounded-[20px] bg-brand-surface border border-brand-border">
            <div className="space-y-4">
              {/* Top Back Header */}
              <div className="flex justify-between items-center border-b border-brand-border pb-2.5">
                <h3 className="font-semibold text-brand-primary text-base">{word.word}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="p-1.5 rounded-full bg-brand-bg text-brand-text-secondary active:scale-90 transition-all flex items-center justify-center border border-brand-border"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* English Meaning */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold">English Meaning</span>
                <p className="text-xs text-brand-text-primary mt-0.5 leading-relaxed">{word.englishMeaning}</p>
              </div>

              {/* Easy Explanation */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-brand-primary font-semibold">Easy Explanation</span>
                <p className="text-xs text-brand-text-secondary mt-0.5 leading-relaxed">{word.easyExplanation || 'A simple word to learn.'}</p>
              </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-brand-success font-semibold">Synonyms</span>
                  <p className="text-xs text-brand-text-secondary mt-0.5 truncate">{word.synonyms.slice(0, 3).join(', ')}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-brand-error font-semibold">Antonyms</span>
                  <p className="text-xs text-brand-text-secondary mt-0.5 truncate">{word.antonyms.slice(0, 3).join(', ')}</p>
                </div>
              </div>

              {/* Memory Trick Box */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-brand-text-muted font-semibold">Memory Trick</span>
                <p className="text-xs text-brand-text-secondary italic mt-0.5 bg-brand-bg border border-brand-border p-2.5 rounded-xl leading-relaxed">
                  {word.memoryTrick}
                </p>
              </div>
            </div>

            {/* Learn Button */}
            <div className="pt-4 border-t border-brand-border mt-2">
              <button
                onClick={handleLearnClick}
                disabled={isLearned}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-semibold transition-all w-full justify-center min-h-[44px] ${
                  isLearned 
                    ? 'bg-brand-success/15 border border-brand-success/20 text-brand-success cursor-default'
                    : 'bg-brand-primary hover:opacity-95 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLearned ? 'Learned' : 'Mark as Learned (+10 XP)'}</span>
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
