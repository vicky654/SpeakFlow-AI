import React, { useState } from 'react';
import { Word } from '../types';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { Volume2, Star, CheckCircle2, RotateCcw, HelpCircle, ArrowRightLeft } from 'lucide-react';

interface WordCardProps {
  word: Word;
  isLearned: boolean;
  onLearned?: () => void;
}

export const WordCard: React.FC<WordCardProps> = ({ word, isLearned, onLearned }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const favorites = useAuthStore(state => state.user?.favorites || []);
  const learnWord = useLearningStore(state => state.learnWord);

  const isFavorited = favorites.includes(word._id);

  // Web Speech Pronunciation (Using native browser-native Speech API as approved)
  const speakWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const handleLearnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    learnWord(word._id);
    if (onLearned) onLearned();
  };

  return (
    <div 
      className="w-full max-w-sm h-[390px] flip-card cursor-pointer select-none group" 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full flip-card-inner rounded-3xl glass-card transition-all duration-500 border border-slate-200/10 dark:border-slate-800/80 shadow-xl ${isFlipped ? 'flip-card-flipped' : ''}`}>
        
        {/* CARD FRONT */}
        <div className="absolute inset-0 w-full h-full flip-card-front p-5 flex flex-col justify-between rounded-3xl bg-slate-900/60 dark:bg-slate-950/60">
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {word.partOfSpeech}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(word._id);
              }}
              className={`p-2 rounded-full border transition-all active:scale-90 ${
                isFavorited 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Main Word */}
          <div className="flex flex-col items-center justify-center text-center space-y-3.5 my-auto">
            <h2 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              {word.word}
            </h2>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-mono text-xs">{word.pronunciation}</span>
              <button 
                onClick={speakWord}
                className="p-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 active:scale-95 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="pt-3">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Hindi Meaning</span>
              <p className="text-xl font-black text-slate-100 mt-0.5">{word.hindiMeaning}</p>
            </div>
          </div>

          {/* Bottom Flip Indicator */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
            <div className="flex items-center space-x-1">
              <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
              <span>Tap card to flip</span>
            </div>
            <span className="font-semibold text-slate-600">English Meanings →</span>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="absolute inset-0 w-full h-full flip-card-back p-5 flex flex-col justify-between overflow-y-auto rounded-3xl bg-slate-900/90 dark:bg-slate-950/90">
          <div className="space-y-3.5">
            {/* Top Back Header */}
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <h3 className="font-extrabold text-indigo-400 text-base">{word.word}</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 active:scale-90 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* English Meaning */}
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">English Meaning</span>
              <p className="text-xs text-slate-200 mt-0.5 leading-normal">{word.englishMeaning}</p>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Synonyms</span>
                <p className="text-xs text-slate-300 mt-0.5 truncate">{word.synonyms.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-rose-400 font-bold">Antonyms</span>
                <p className="text-xs text-slate-300 mt-0.5 truncate">{word.antonyms.slice(0, 3).join(', ')}</p>
              </div>
            </div>

            {/* Memory Trick Box */}
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Memory Trick</span>
              <p className="text-xs text-indigo-200 italic mt-0.5 bg-indigo-950/40 border border-indigo-850/50 p-2.5 rounded-xl leading-normal">
                {word.memoryTrick}
              </p>
            </div>

            {/* Common Mistakes */}
            <div>
              <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Common Mistake</span>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-normal">{word.commonMistakes}</p>
            </div>
          </div>

          {/* Learn Button */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={handleLearnClick}
              disabled={isLearned}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full justify-center ${
                isLearned 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                  : 'bg-indigo-600 active:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLearned ? 'Learned' : 'Mark as Learned (+10 XP)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
