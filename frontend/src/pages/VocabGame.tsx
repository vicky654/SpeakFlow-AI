import React, { useState, useEffect, useRef } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
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

    // Generate questions
    const generated = sourceList.map(word => {
      // Pick 3 random incorrect meanings
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

    // Start running clock
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
      clearInterval(timerRef.current!);
      endGame(`Clean sweep! You finished all ${speedQuestions.length} questions.`);
    }
  };

  // INITIALIZE WORD MATCHER
  const startWordMatcher = () => {
    const sourceList = allWords.length >= 4 ? allWords : dailyWords;
    if (sourceList.length === 0) return;

    // Pick 4 words
    const chosen = sourceList.sort(() => 0.5 - Math.random()).slice(0, 4);

    const words: MatchItem[] = chosen.map(w => ({
      id: w._id + '_w',
      text: w.word,
      type: 'word' as const,
      matchId: w._id
    })).sort(() => 0.5 - Math.random());

    const meanings: MatchItem[] = chosen.map(w => ({
      id: w._id + '_m',
      text: w.englishMeaning,
      type: 'meaning' as const,
      matchId: w._id
    })).sort(() => 0.5 - Math.random());

    setWordsCol(words);
    setMeaningsCol(meanings);
    setMatchedIds([]);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setScore(0);
    setGameState('match');
  };

  // HANDLE COLUMN CARD MATCH SELECTIONS
  const handleMatchClick = (item: MatchItem) => {
    if (matchedIds.includes(item.matchId)) return;

    if (item.type === 'word') {
      setSelectedWord(item);
      if (selectedMeaning) {
        verifyMatch(item, selectedMeaning);
      }
    } else {
      setSelectedMeaning(item);
      if (selectedWord) {
        verifyMatch(selectedWord, item);
      }
    }
  };

  const verifyMatch = (w: MatchItem, m: MatchItem) => {
    if (w.matchId === m.matchId) {
      // It is a match!
      setMatchedIds(prev => [...prev, w.matchId]);
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    // reset selection
    setSelectedWord(null);
    setSelectedMeaning(null);
  };

  useEffect(() => {
    // Check if matcher is complete
    if (gameState === 'match' && matchedIds.length === 4 && matchedIds.length > 0) {
      setTimeout(() => {
        endGame('Bravo! You matched all pairs perfectly.');
      }, 600);
    }
  }, [matchedIds, gameState]);

  // TERMINATE AND CALCULATE SCORE REWARDS
  const endGame = async (msg: string) => {
    setResultMsg(msg);
    setGameState('result');
    if (timerRef.current) clearInterval(timerRef.current);

    // Reward math
    const xpReward = score * 15;
    const coinReward = score * 3;
    setEarnedXp(xpReward);
    setEarnedCoins(coinReward);

    // Call API (using practice/time route to sync XP points on user profile)
    const token = useAuthStore.getState().token;
    if (token && score > 0) {
      try {
        await fetch('http://localhost:5000/api/learning/practice/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ skill: 'reading', duration: score * 15 }) // counts as reading practice duration
        });
        await useAuthStore.getState().loadUser();
      } catch (err) {
        console.error('Failed to sync game scores', err);
      }
    }
    playSound('complete');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <Gamepad2 className="w-8 h-8 text-indigo-400" />
            <span>Vocab Game Arcade</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Play matches, race against timers, and claim bonus coins.</p>
        </div>
        
        {gameState !== 'menu' && (
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setGameState('menu');
            }}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quit Game</span>
          </button>
        )}
      </div>

      {/* GAME VIEW MANAGER */}

      {/* 1. GAME SELECTION MENU */}
      {gameState === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Speed Quiz Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[300px] hover:border-indigo-500/40 hover:-translate-y-1 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Timer className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-white">30-Second Speed Quiz</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A high-speed sprint! Read vocabulary words and identify their correct meanings before the 30-second clock hits zero.
              </p>
            </div>
            <button
              onClick={startSpeedQuiz}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
            >
              Start Sprint
            </button>
          </div>

          {/* Word Matcher Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between h-[300px] hover:border-indigo-500/40 hover:-translate-y-1 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Meaning Matcher</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect shuffled word columns with their English definitions. Requires analytical pairing and accuracy.
              </p>
            </div>
            <button
              onClick={startWordMatcher}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              Play Matcher
            </button>
          </div>
        </div>
      )}

      {/* 2. SPEED QUIZ ACTIVE BOARD */}
      {gameState === 'speed' && speedQuestions[currentSpeedIdx] && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Timer className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
              <span className="font-mono font-bold text-xl">{speedTimer}s</span>
            </div>
            <div className="text-xs font-bold text-slate-400">
              QUESTION {currentSpeedIdx + 1} OF {speedQuestions.length}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Score: {score}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
            <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">What is the meaning of:</span>
            <h2 className="text-4xl font-extrabold tracking-wide text-white font-sans">{speedQuestions[currentSpeedIdx].word}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speedQuestions[currentSpeedIdx].options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSpeedAnswer(opt)}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-left text-xs font-semibold text-slate-300 hover:border-indigo-500/60 hover:bg-indigo-950/20 hover:text-white transition-all duration-150 leading-relaxed"
              >
                <div className="flex space-x-3 items-start">
                  <span className="px-1.5 py-0.5 rounded bg-slate-855 text-slate-500 font-mono font-bold">{i + 1}</span>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORD MATCHER ACTIVE BOARD */}
      {gameState === 'match' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <span className="text-xs text-slate-400 font-bold">MATCH WORDS TO MEANINGS</span>
            <div className="flex items-center space-x-1 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pairs: {matchedIds.length}/4</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
            {/* WORDS COLUMN */}
            <div className="flex flex-col space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider text-center">Words</h4>
              {wordsCol.map(item => {
                const isMatched = matchedIds.includes(item.matchId);
                const isSelected = selectedWord?.id === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`p-4 border rounded-2xl text-center font-bold text-sm transition-all duration-200 ${
                      isMatched 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/60 line-through cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            {/* MEANINGS COLUMN */}
            <div className="flex flex-col space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">Definitions</h4>
              {meaningsCol.map(item => {
                const isMatched = matchedIds.includes(item.matchId);
                const isSelected = selectedMeaning?.id === item.id;
                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchClick(item)}
                    className={`p-4 border rounded-2xl text-left text-xs transition-all duration-200 leading-relaxed ${
                      isMatched 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/60 line-through cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
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
        <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center max-w-md mx-auto space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Game Finished!</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{resultMsg}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="bg-indigo-950/30 border border-indigo-900/30 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">XP gained</span>
              <p className="text-2xl font-extrabold text-indigo-400">+{earnedXp} XP</p>
            </div>
            <div className="bg-amber-950/30 border border-amber-900/30 p-4 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Coins Claimed</span>
              <p className="text-2xl font-extrabold text-amber-400">+{earnedCoins} Coins</p>
            </div>
          </div>

          <div className="flex gap-4 w-full pt-4">
            <button
              onClick={() => setGameState('menu')}
              className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Menu
            </button>
            <button
              onClick={() => {
                 // Restart with a new speed quiz by default
                 startSpeedQuiz();
               }}
              className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2"
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
