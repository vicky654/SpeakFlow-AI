import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { WordCard } from '../components/WordCard';
import { Star, Sparkles, Gamepad2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const Vocabulary: React.FC = () => {
  const { dailyWords, allWords, fetchDailyWords, fetchAllWords, refreshDailyWords, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'daily' | 'favorites'>('daily');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDailyWords();
    fetchAllWords();
  }, [fetchDailyWords, fetchAllWords]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDailyWords();
    setRefreshing(false);
    setCarouselIndex(0);
  };

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
      <div className="flex justify-between items-start">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-extrabold text-white">Vocabulary Cards</h2>
          <p className="text-xs text-brand-text-secondary">Drill flashcards, pronunciation tips, and examples daily.</p>
        </div>
        {activeTab === 'daily' && (
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-card border border-brand-border rounded-xl text-[10px] font-bold text-brand-text-secondary hover:text-white disabled:opacity-20 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* 2. TAB TOGGLER (FULL WIDTH ON MOBILE) */}
      <div className="flex bg-brand-card border border-brand-border p-1 rounded-xl w-full">
        <button
          onClick={() => { setActiveTab('daily'); setCarouselIndex(0); }}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'daily' 
              ? 'bg-indigo-600 text-white' 
              : 'text-brand-text-secondary hover:text-brand-text-primary'
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
              : 'text-brand-text-secondary hover:text-brand-text-primary'
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
          <p className="text-xs text-brand-text-secondary">Fetching dictionary database...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="h-[300px] bg-brand-card border border-brand-border shadow-level-1 rounded-3xl border border-brand-border flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-3xl">📚</span>
          <h3 className="text-sm font-bold text-brand-text-primary">No words found</h3>
          <p className="text-[11px] text-brand-text-muted max-w-xs leading-normal">
            {activeTab === 'favorites' 
              ? 'You haven\'t added any words to your favorites yet. Tap the star icon on any card to bookmark it!'
              : 'Our dictionary is currently empty. Re-seed database or add cards in admin panel.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card counter */}
          <div className="flex items-center justify-between text-xs text-brand-text-secondary font-bold px-1">
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
              onNext={handleNext}
              onPrev={handlePrev}
              isFirstCard={carouselIndex === 0}
            />
          </div>

          {/* Carousel Dot Indicators + Next/Prev Buttons */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="p-2.5 rounded-full bg-brand-card border border-brand-border text-brand-text-secondary disabled:opacity-20 hover:bg-brand-surface transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1.5 justify-center py-2 max-w-[200px] mx-auto overflow-hidden">
              {activeList.map((_, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === carouselIndex ? 'bg-brand-primary w-3.5' : 'bg-brand-border w-1.5'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={carouselIndex === activeList.length - 1}
              className="p-2.5 rounded-full bg-brand-card border border-brand-border text-brand-text-secondary disabled:opacity-20 hover:bg-brand-surface transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. DAILY STUDY TARGET OVERVIEW & GAME UNLOCK */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 border border-brand-border space-y-4">
        {/* Study targets progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-brand-text-secondary">Daily Study Goal Progress</span>
            <span className="text-indigo-400">{dailyVocabProgress}/10 words</span>
          </div>
          <div className="w-full h-2.5 bg-brand-bg rounded-full border border-brand-border overflow-hidden">
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
            : 'bg-brand-surface/40 border-brand-border text-brand-text-muted'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl ${isGameUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-card text-brand-text-muted'} shrink-0`}>
              <Gamepad2 className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-brand-text-primary">Vocab Memory Matches</h4>
              <p className="text-[10px] text-brand-text-secondary leading-normal mt-0.5">
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
                : 'bg-brand-card text-brand-text-muted border border-brand-border cursor-not-allowed'
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
