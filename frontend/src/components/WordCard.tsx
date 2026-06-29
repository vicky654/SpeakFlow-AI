import React, { useState } from 'react';
import { Word } from '../types';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { Volume2, Star, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

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

  // Web Speech Pronunciation
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
    <div className="w-full max-w-md h-[450px] flip-card cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full flip-card-inner rounded-2xl glass-card transition-all duration-500 ${isFlipped ? 'flip-card-flipped' : ''}`}>
        
        {/* CARD FRONT */}
        <div className="absolute inset-0 w-full h-full flip-card-front p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {word.partOfSpeech}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(word._id);
              }}
              className={`p-2 rounded-full border transition-all ${
                isFavorited 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              {word.word}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono text-sm">{word.pronunciation}</span>
              <button 
                onClick={speakWord}
                className="p-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-6">
              <p className="text-sm text-slate-400 uppercase tracking-widest">Hindi Meaning</p>
              <p className="text-2xl font-bold text-slate-200 mt-1">{word.hindiMeaning}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span>Tap to flip and study details</span>
            <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* CARD BACK */}
        <div className="absolute inset-0 w-full h-full flip-card-back p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <h3 className="font-bold text-indigo-400 text-lg">{word.word}</h3>
              <button 
                onClick={() => setIsFlipped(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Meaning</p>
              <p className="text-sm text-slate-200 mt-0.5">{word.englishMeaning}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Synonyms</p>
                <p className="text-xs text-slate-300 mt-0.5">{word.synonyms.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold">Antonyms</p>
                <p className="text-xs text-slate-300 mt-0.5">{word.antonyms.slice(0, 3).join(', ')}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Memory Trick</p>
              <p className="text-xs text-indigo-200 italic mt-0.5 bg-indigo-950/40 border border-indigo-800/30 p-2 rounded-lg">
                {word.memoryTrick}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Common Mistake</p>
              <p className="text-xs text-amber-200 mt-0.5">{word.commonMistakes}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={handleLearnClick}
              disabled={isLearned}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all w-full justify-center ${
                isLearned 
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isLearned ? 'Learned' : 'Mark as Learned (+10 XP)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
