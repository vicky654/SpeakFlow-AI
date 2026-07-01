import React, { useState, useEffect, useRef } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import API_BASE_URL from '../config/api';
import { Gamepad2, Timer, Sparkles, Coins, HelpCircle, Trophy, RotateCcw, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface MatchItem {
  id: string;
  text: string;
  type: 'word' | 'meaning';
  matchId: string;
}

export const VocabGame: React.FC = () => {
  const { dailyWords, allWords } = useLearningStore();
  const user = useAuthStore(state => state.user);
  
  const [gameState, setGameState] = useState<'menu' | 'speed' | 'match' | 'result'>('menu');
  const [score, setScore] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [resultMsg, setResultMsg] = useState('');

  // 1. SPEED QUIZ STATES
  const [speedQuestions, setSpeedQuestions] = useState<any[]>([]);
  const [currentSpeedIdx, setCurrentSpeedIdx] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2. MATCH MATCH STATES
  const [wordsCol, setWordsCol] = useState<MatchItem[]>([]);
  const [meaningsCol, setMeaningsCol] = useState<MatchItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<MatchItem | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<MatchItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  // Sound Synth reference
  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      let text = type === 'correct' ? 'Correct!' : type === 'wrong' ? 'Incorrect!' : 'Congratulations!';
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.3;
      u.volume = 0.3;
      window.speechSynthesis.speak(u);
    }
  };

  // INITIALIZE SPEED QUIZ
  const startSpeedQuiz = () => {
    const sourceList = allWords.length >= 4 ? allWords : dailyWords;
    if (sourceList.length === 0) return;

    const generated = sourceList.map(word => {
      const incorrects = sourceList
        .filter(w => w._id !== word._id)
        .map(w => w.englishMeaning);
      
      const shuffledIncorrects = incorrects.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...shuffledIncorrects, word.englishMeaning].sort(() => 0.5 - Math.random());

      return {
        word: word.word,
        correctMeaning: word.englishMeaning,
        options
      };
    }).sort(() => 0.5 - Math.random());

    setSpeedQuestions(generated);
    setCurrentSpeedIdx(0);
    setScore(0);
    setSpeedTimer(30);
    setGameState('speed');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSpeedTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endGame('Time Up! You ran out of time.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // HANDLE SPEED ANSWER
  const handleSpeedAnswer = (option: string) => {
    const currentQ = speedQuestions[currentSpeedIdx];
    const isCorrect = option === currentQ.correctMeaning;

    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    if (currentSpeedIdx < speedQuestions.length - 1) {
      setCurrentSpeedIdx(prev => prev + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      endGame(`Great job! You finished all questions.`);
    }
  };

  // INITIALIZE WORD MATCHER
  const startWordMatcher = () => {
    const sourceList = allWords.length >= 4 ? allWords : dailyWords;
    if (sourceList.length < 4) {
      alert("Study at least 4 words in vocabulary first to unlock matching game!");
      return;
    }

    const testWords = [...sourceList].sort(() => 0.5 - Math.random()).slice(0, 4);

    const leftCol: MatchItem[] = testWords.map(w => ({
      id: `word-${w._id}`,
      text: w.word,
      type: 'word' as const,
      matchId: w._id
    })).sort(() => 0.5 - Math.random());

    const rightCol: MatchItem[] = testWords.map(w => ({
      id: `mean-${w._id}`,
      text: w.englishMeaning,
      type: 'meaning' as const,
      matchId: w._id
    })).sort(() => 0.5 - Math.random());

    setWordsCol(leftCol);
    setMeaningsCol(rightCol);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatchedIds([]);
    setScore(0);
    setGameState('match');
  };

  const handleMatchClick = (item: MatchItem) => {
    if (item.type === 'word') {
      setSelectedWord(item);
      checkPairs(item, selectedMeaning);
    } else {
      setSelectedMeaning(item);
      checkPairs(selectedWord, item);
    }
  };

  const checkPairs = (w: MatchItem | null, m: MatchItem | null) => {
    if (w && m) {
      if (w.matchId === m.matchId) {
        setMatchedIds(prev => {
          const next = [...prev, w.matchId];
          if (next.length === 4) {
            setTimeout(() => {
              endGame("Succeeded! All matches cleared.");
            }, 500);
          }
          return next;
        });
        playSound('correct');
      } else {
        playSound('wrong');
      }
      setSelectedWord(null);
      setSelectedMeaning(null);
    }
  };

  // COMPLETE & SUBMIT SCORE
  const endGame = async (msg: string) => {
    setResultMsg(msg);
    setGameState('result');
    playSound('complete');

    // Submit points
    const xpBonus = 100;
    const coinsBonus = 15;
    setEarnedXp(xpBonus);
    setEarnedCoins(coinsBonus);

    try {
      await fetch(`${API_BASE_URL}/gamification/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ xp: xpBonus, coins: coinsBonus })
      });
      await useAuthStore.getState().loadUser();
    } catch (e) {
      console.error('Failed to sync game points', e);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6 text-brand-text-primary">
      
      {/* HEADER ROW */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border px-1 shrink-0">
        <div className="flex items-center gap-3">
          {gameState !== 'menu' && (
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameState('menu');
              }}
              style={{ borderRadius: '12px', padding: '8px' }}
              className="bg-brand-card border border-brand-border text-brand-text-secondary hover:bg-brand-surface transition-all mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-bold text-brand-text-primary flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-indigo-500" />
              <span>Vocabulary Playground</span>
            </h2>
            <p className="text-xs text-brand-text-secondary">Study English by playing gamified speed speed-runs and paired matches.</p>
          </div>
        </div>
      </div>

      {/* 1. START GAME MENU OPTIONS */}
      {gameState === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Speed Quiz Card */}
          <div className="card flex flex-col justify-between h-[320px] hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all">
            <div className="space-y-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <Timer className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-brand-text-primary">30-Second Speed Quiz</h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                A high-speed sprint! Read vocabulary words and identify their correct meanings before the 30-second clock hits zero.
              </p>
            </div>
            <button
              onClick={startSpeedQuiz}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99]"
            >
              Start Sprint
            </button>
          </div>

          {/* Word Matcher Card */}
          <div className="card flex flex-col justify-between h-[320px] hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
            <div className="space-y-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-text-primary">Meaning Matcher</h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Connect shuffled word columns with their English definitions. Requires analytical pairing and accuracy.
              </p>
            </div>
            <button
              onClick={startWordMatcher}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md active:scale-[0.99]"
            >
              Play Matcher
            </button>
          </div>
        </div>
      )}

      {/* 2. SPEED QUIZ ACTIVE BOARD */}
      {gameState === 'speed' && speedQuestions[currentSpeedIdx] && (
        <div className="card space-y-6">
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Timer className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
              <span className="font-mono font-bold text-xl">{speedTimer}s</span>
            </div>
            <div className="text-xs font-bold text-brand-text-secondary">
              QUESTION {currentSpeedIdx + 1} OF {speedQuestions.length}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Score: {score}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
            <span className="text-brand-text-secondary uppercase tracking-widest text-[10px] font-bold">What is the meaning of:</span>
            <h2 className="text-3xl font-bold tracking-wide text-brand-text-primary font-sans">{speedQuestions[currentSpeedIdx].word}</h2>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {speedQuestions[currentSpeedIdx].options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSpeedAnswer(opt)}
                className="p-3 bg-brand-card border border-brand-border rounded-xl text-left text-xs font-semibold text-brand-text-primary hover:border-indigo-400 hover:bg-brand-surface transition-all duration-150 leading-relaxed active:scale-[0.99]"
              >
                <div className="flex space-x-3 items-center">
                  <span className="w-6 h-6 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-[10px] font-bold shrink-0 text-brand-text-secondary">{i + 1}</span>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORD MATCHER ACTIVE BOARD */}
      {gameState === 'match' && (
        <div className="card space-y-6">
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <span className="text-xs text-brand-text-secondary font-bold">MATCH WORDS TO MEANINGS</span>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pairs: {matchedIds.length}/4</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
            {/* WORDS COLUMN */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider text-center">Words</h4>
              {wordsCol.map(item => {
                const isMatched = matchedIds.includes(item.matchId);
                const isSelected = selectedWord?.id === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`p-3 border rounded-xl text-center font-bold text-xs transition-all duration-200 ${
                      isMatched 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/60 line-through cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]'
                          : 'bg-brand-card border-brand-border text-brand-text-primary hover:border-indigo-400 hover:bg-brand-surface active:scale-[0.99]'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            {/* MEANINGS COLUMN */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider text-center">Definitions</h4>
              {meaningsCol.map(item => {
                const isMatched = matchedIds.includes(item.matchId);
                const isSelected = selectedMeaning?.id === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`p-3 border rounded-xl text-left text-xs transition-all duration-200 leading-relaxed ${
                      isMatched 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500/60 line-through cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.02]'
                          : 'bg-brand-card border-brand-border text-brand-text-primary hover:border-indigo-400 hover:bg-brand-surface active:scale-[0.99]'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESULT MODAL VIEWER */}
      {gameState === 'result' && (
        <div className="card text-center max-w-md mx-auto space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce">
            <Trophy className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-brand-text-primary">Game Finished!</h2>
            <p className="text-xs text-brand-text-secondary leading-relaxed">{resultMsg}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">
              <span className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-wider">XP gained</span>
              <p className="text-xl font-extrabold text-indigo-600 mt-0.5">+{earnedXp} XP</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
              <span className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-wider">Coins Claimed</span>
              <p className="text-xl font-extrabold text-amber-600 mt-0.5">+{earnedCoins} Coins</p>
            </div>
          </div>

          <div className="flex gap-4 w-full pt-4">
            <button
               onClick={() => setGameState('menu')}
               style={{ borderRadius: '12px', padding: '12px' }}
               className="flex-grow py-3 bg-brand-card border border-brand-border text-brand-text-secondary hover:bg-brand-surface text-xs font-bold transition-all"
             >
               Menu
            </button>
            <button
              onClick={() => {
                 startSpeedQuiz();
               }}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
