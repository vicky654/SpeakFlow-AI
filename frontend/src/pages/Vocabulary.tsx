import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { WordCard } from '../components/WordCard';
import { Star, Sparkles, Gamepad2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const Vocabulary: React.FC = () => {
  const { dailyWords, allWords, fetchDailyWords, fetchAllWords, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'daily' | 'favorites'>('daily');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchDailyWords();
    fetchAllWords();
  }, [fetchDailyWords, fetchAllWords]);

  const favoritesList = allWords.filter(w => user?.favorites.includes(w._id));
  const dailyChallenge = useLearningStore(state => state.dailyChallenge);
  const dailyVocabProgress = dailyChallenge?.checklist?.vocab?.current || 0;
  const isGameUnlocked = dailyVocabProgress >= 10;

  const handleNext = () => {
    const list = activeTab === 'daily' ? dailyWords : favoritesList;
    if (carouselIndex < list.length - 1) {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const handlePrev = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  const activeList = activeTab === 'daily' ? dailyWords : favoritesList;
  const currentWord = activeList[carouselIndex];

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-6">
      
      {/* 1. COMPACT HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Vocabulary Cards</h2>
        <p className="text-xs text-slate-400">Drill flashcards, pronunciation tips, and examples daily.</p>
      </div>

      {/* 2. TAB TOGGLER (FULL WIDTH ON MOBILE) */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full">
        <button
          onClick={() => { setActiveTab('daily'); setCarouselIndex(0); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'daily' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Daily 10 Words</span>
        </button>
        <button
          onClick={() => { setActiveTab('favorites'); setCarouselIndex(0); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'favorites' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Starred ({favoritesList.length})</span>
        </button>
      </div>

      {/* 3. CORE VIEWER */}
      {loading ? (
        <div className="h-[350px] flex items-center justify-center flex-col space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Fetching dictionary database...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="h-[300px] glass-card rounded-3xl border border-slate-200/10 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-3xl">📚</span>
          <h3 className="text-sm font-bold text-slate-200">No words found</h3>
          <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
            {activeTab === 'favorites' 
              ? 'You haven\'t added any words to your favorites yet. Tap the star icon on any card to bookmark it!'
              : 'Our dictionary is currently empty. Re-seed database or add cards in admin panel.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span>CARD {carouselIndex + 1} OF {activeList.length}</span>
            <span className="text-indigo-400 font-normal">
              {currentWord && user?.favorites.includes(currentWord._id) ? 'Bookmarked ★' : ''}
            </span>
          </div>

          {/* Active WordCard */}
          <div className="flex justify-center">
            <WordCard 
              word={currentWord}
              isLearned={user?.xp !== undefined && false} // Managed by child triggers
            />
          </div>

          {/* Carousel Dot Indicators + Next/Prev Buttons */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-20 hover:bg-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1.5 max-w-[200px] overflow-hidden truncate px-2 py-1">
              {activeList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
                    idx === carouselIndex ? 'bg-indigo-500 w-3.5' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={carouselIndex === activeList.length - 1}
              className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-20 hover:bg-slate-800 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. DAILY STUDY TARGET OVERVIEW & GAME UNLOCK */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-4">
        {/* Study targets progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Daily Study Goal Progress</span>
            <span className="text-indigo-400">{dailyVocabProgress}/10 words</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (dailyVocabProgress / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Match game unlock section */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isGameUnlocked 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
            : 'bg-slate-950/40 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl ${isGameUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'} shrink-0`}>
              <Gamepad2 className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-200">Vocab Memory Matches</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                {isGameUnlocked 
                  ? 'Congratulations! Play vocabulary matching games to test your memory skills.' 
                  : 'Unlock memory matching games after completing study of all 10 words.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/game')}
            className={`w-full py-2 rounded-xl text-xs font-bold mt-3 transition-all ${
              isGameUnlocked 
                ? 'bg-emerald-600 active:bg-emerald-500 text-white shadow-md' 
                : 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed'
            }`}
            disabled={!isGameUnlocked}
          >
            {isGameUnlocked ? 'Start Memory Game' : 'Locked (Complete 10 cards)'}
          </button>
        </div>
      </div>
    </div>
  );
};
