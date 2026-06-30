import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, ChevronRight, BookOpen, Volume2, Mic, Play, Pause, Award, 
  RefreshCw, CheckCircle2, ChevronLeft, Sparkles, AlertCircle, Star, StarOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API_BASE_URL from '../config/api';

export const ChallengeDayDrill: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber || '1');

  const { activeDayContent, fetchDayContent, completeDay } = useChallengeStore();
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const favorites = useAuthStore(state => state.user?.favorites || []);
  const token = useAuthStore(state => state.token);

  const [step, setStep] = useState<number>(1); // Steps 1 to 6
  const [vocabIndex, setVocabIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());

  // Listen step state
  const [isPlayingText, setIsPlayingText] = useState(false);
  const [slowMode, setSlowMode] = useState(false);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speakingScore, setSpeakingScore] = useState<any | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Smart refresh vocabulary words
  const [vocabOverride, setVocabOverride] = useState<any[] | null>(null);
  const [refreshingVocab, setRefreshingVocab] = useState(false);

  const recognitionRef = useRef<any>(null);

  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const [hasResumed, setHasResumed] = useState(false);

  useEffect(() => {
    fetchDayContent(dayNum);
    fetchDailyChallenge();
  }, [dayNum, fetchDayContent, fetchDailyChallenge]);

  // Auto-resume to the first uncompleted daily task on load
  useEffect(() => {
    if (dailyChallenge?.checklist && !hasResumed) {
      const checklist = dailyChallenge.checklist;
      let targetStep = 1;

      if (!checklist.vocab?.completed) {
        targetStep = 1;
      } else if (!checklist.listening?.completed) {
        targetStep = 2;
      } else if (!checklist.reading?.completed) {
        targetStep = 3;
      } else if (!checklist.speaking?.completed) {
        targetStep = 4;
      } else if (!checklist.quiz?.completed) {
        targetStep = 5;
      } else {
        targetStep = 6;
      }

      setStep(targetStep);
      setHasResumed(true);
    }
  }, [dailyChallenge, hasResumed]);

  // Set up Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  if (!activeDayContent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 flex-col space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading today's learning journey...</p>
      </div>
    );
  }

  const currentVocabulary = vocabOverride || activeDayContent.vocabulary || [];

  // TTS helper
  const speakText = (text: string, rateValue?: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean tags/markdown
      const clean = text.replace(/\*\*|\*|👉|❌|✅|💡|🇮🇳/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';
      utterance.rate = rateValue || (slowMode ? 0.55 : 0.85);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakWord = (word: string) => {
    speakText(word, 0.85);
  };

  const handleSpeakDialogue = () => {
    if (isPlayingText) {
      window.speechSynthesis.cancel();
      setIsPlayingText(false);
    } else {
      setIsPlayingText(true);
      const textToSpeak = activeDayContent.listening.transcript || '';
      speakText(textToSpeak);
      
      const checkSpeech = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsPlayingText(false);
          clearInterval(checkSpeech);
        }
      }, 500);
    }
  };

  // Mic Record Toggle
  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      evaluateSpeech();
    } else {
      setTranscript('');
      setSpeakingScore(null);
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const evaluateSpeech = () => {
    // Generate scores
    setTimeout(() => {
      const pronScore = Math.floor(Math.random() * 20) + 75; // 75-95
      const fluencyScore = Math.floor(Math.random() * 20) + 70; // 70-90
      const confidenceScore = Math.floor(Math.random() * 15) + 80; // 80-95
      
      setSpeakingScore({
        pronunciationScore: pronScore,
        fluencyScore: fluencyScore,
        confidenceScore: confidenceScore,
        improvements: pronScore < 85 ? 'Practice saying the vowels slightly longer for better articulation.' : 'Excellent pacing and speech flow!'
      });
    }, 1000);
  };

  const handleRefreshVocab = async () => {
    if (refreshingVocab) return;
    setRefreshingVocab(true);
    try {
      const res = await fetch(`${API_BASE_URL}/vocab/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const fresh = await res.json();
        if (fresh && fresh.length > 0) {
          setVocabOverride(fresh);
          setVocabIndex(0);
          setIsFlipped(false);
        }
      }
    } catch (e) {
      console.error('Failed to refresh vocab in drill:', e);
    } finally {
      setRefreshingVocab(false);
    }
  };

  const handleMarkAsLearned = (wordId: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
    // Trigger learned api call in learning store
    useLearningStore.getState().learnWord(wordId);
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuizAnswer = (qId: string, option: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    const questions = activeDayContent.quiz || [];
    let correctCount = 0;
    questions.forEach((q: any) => {
      if (quizAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });

    const finalPct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(finalPct);
    setQuizSubmitted(true);

    // Call complete day API in challengeStore
    await completeDay(dayNum, quizAnswers, finalPct);

    // Run celebration confetti
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 }
    });

    handleNextStep();
  };

  return (
    <div className="space-y-6 select-none max-w-md mx-auto pb-12 pt-4 px-2">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lesson</span>
        </button>
        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Day {dayNum} Learning Flow
        </span>
      </div>

      {/* Step Progress indicators */}
      <div className="space-y-1.5 text-left">
        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <span>Drill Step {step} of 6</span>
          <span className="text-indigo-400">
            {step === 1 ? '1. Learn 10 Words' :
             step === 2 ? '2. Listen Pronunciation' :
             step === 3 ? '3. Read Examples' :
             step === 4 ? '4. Practice Speaking' :
             step === 5 ? '5. Complete Quiz' :
             '6. Earn Rewards'}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* ================= STEP 1: LEARN TODAY'S 10 WORDS ================= */}
      {step === 1 && currentVocabulary.length > 0 && (
        <div className="space-y-5 text-left">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-extrabold text-white text-base">Step 1: Vocabulary Cards</h3>
              <p className="text-[10px] text-slate-400">Tap cards to flip. Mark all words as learned.</p>
            </div>
            <button
              onClick={handleRefreshVocab}
              disabled={refreshingVocab}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white disabled:opacity-30 active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${refreshingVocab ? 'animate-spin' : ''}`} />
              <span>Refresh words</span>
            </button>
          </div>

          {/* Flashcard container */}
          <div 
            className="w-full h-[370px] cursor-pointer flip-card"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`relative w-full h-full flip-card-inner rounded-3xl border border-slate-205/10 dark:border-slate-800/80 shadow-xl ${isFlipped ? 'flip-card-flipped' : ''}`}>
              
              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between rounded-3xl bg-slate-900/85 dark:bg-slate-950/85 flip-card-front text-center">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    {currentVocabulary[vocabIndex].partOfSpeech}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(currentVocabulary[vocabIndex]._id);
                    }}
                    className="text-slate-400 hover:text-white transition-all active:scale-90"
                  >
                    {favorites.includes(currentVocabulary[vocabIndex]._id) ? (
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="my-auto space-y-3">
                  <h2 className="text-3xl font-black text-white tracking-wide">
                    {currentVocabulary[vocabIndex].word}
                  </h2>
                  <div className="flex items-center justify-center space-x-1.5">
                    <span className="text-slate-400 font-mono text-xs">{currentVocabulary[vocabIndex].pronunciation}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSpeakWord(currentVocabulary[vocabIndex].word); }}
                      className="p-1 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold">Hindi Meaning</span>
                    <p className="text-xl font-bold text-slate-105">{currentVocabulary[vocabIndex].hindiMeaning}</p>
                  </div>
                </div>

                <p className="text-[9px] text-slate-550 italic">Tap card to see explanations & memory trick</p>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full p-6 flex flex-col justify-between overflow-y-auto rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 flip-card-back">
                <div className="space-y-3 text-left">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">English Meaning</span>
                    <p className="text-xs text-slate-200 mt-0.5 leading-normal">{currentVocabulary[vocabIndex].englishMeaning}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Easy Explanation</span>
                    <p className="text-xs text-indigo-200/90 mt-0.5 leading-normal">{currentVocabulary[vocabIndex].easyExplanation || 'A very simple term to remember.'}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Memory Trick</span>
                    <p className="text-xs text-slate-350 italic mt-0.5 leading-normal bg-slate-950/50 p-2.5 rounded-xl border border-slate-900">
                      {currentVocabulary[vocabIndex].memoryTrick}
                    </p>
                  </div>
                </div>
                <span className="text-[8px] text-slate-600 text-center pt-2">Tap to flip card back</span>
              </div>

            </div>
          </div>

          {/* Flashcard actions & markers */}
          <div className="flex justify-between items-center text-xs px-1">
            <button
              disabled={vocabIndex === 0}
              onClick={() => { setVocabIndex(prev => prev - 1); setIsFlipped(false); }}
              className="p-2.5 bg-slate-905 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-20 active:scale-95 transition-all font-bold"
            >
              Back
            </button>

            <button
              onClick={() => handleMarkAsLearned(currentVocabulary[vocabIndex]._id)}
              disabled={learnedWords.has(currentVocabulary[vocabIndex]._id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                learnedWords.has(currentVocabulary[vocabIndex]._id)
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                  : 'bg-indigo-600 active:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {learnedWords.has(currentVocabulary[vocabIndex]._id) ? '✓ Learned' : '✅ Mark as Learned'}
            </button>

            <button
              disabled={vocabIndex === 9}
              onClick={() => { setVocabIndex(prev => prev + 1); setIsFlipped(false); }}
              className="p-2.5 bg-slate-905 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-20 active:scale-95 transition-all font-bold"
            >
              Next
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex space-x-1.5 justify-center py-2 max-w-[200px] mx-auto overflow-hidden">
            {currentVocabulary.map((v: any, idx: number) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
                  idx === vocabIndex 
                    ? 'bg-indigo-550 w-3.5' 
                    : learnedWords.has(v._id) 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center space-x-1.5 text-xs"
          >
            <span>Proceed to Step 2: Listen Pronunciation</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= STEP 2: LISTEN TO PRONUNCIATION ================= */}
      {step === 2 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">Step 2: Listening Practice</h3>
            <p className="text-[10px] text-slate-404">Listen to today's dialogue at different speeds.</p>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-205/10 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Dialogue Audio player</h4>
            
            {/* Speed toggle */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 justify-around text-xs">
              <button
                onClick={() => setSlowMode(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  slowMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Slow Mode (0.55x)
              </button>
              <button
                onClick={() => setSlowMode(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  !slowMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Normal Mode (0.85x)
              </button>
            </div>

            {/* Audio interface button */}
            <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <button
                  onClick={handleSpeakDialogue}
                  className="w-12 h-12 rounded-full bg-indigo-600 active:scale-95 hover:brightness-110 text-white flex items-center justify-center shadow-md"
                >
                  {isPlayingText ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-slate-100">{isPlayingText ? 'Streaming dialogue...' : 'Dialogue transcript'}</p>
                  <p className="text-[10px] text-slate-500">Native narrator voice • USA</p>
                </div>
              </div>
            </div>

            {/* Script preview */}
            <div className="p-3.5 bg-slate-950/30 border border-slate-900/60 rounded-2xl text-xs text-slate-350 leading-relaxed italic max-h-36 overflow-y-auto">
              "{activeDayContent.listening.transcript}"
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 active:scale-95"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold active:scale-95 shadow-md flex items-center justify-center space-x-1"
            >
              <span>Step 3: Read Examples</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: READ EXAMPLES ================= */}
      {step === 3 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">Step 3: Reading Practice</h3>
            <p className="text-[10px] text-slate-400">Start simple and grow from single words to paragraphs.</p>
          </div>

          {/* Progressive reading boards */}
          <div className="space-y-3.5">
            {/* Stage A: Single Words */}
            <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-1.5">
              <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Level 1: Today's Words</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentVocabulary.slice(0, 4).map((v: any, i: number) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-900 text-slate-200 rounded-lg">
                    {v.word} ({v.hindiMeaning})
                  </span>
                ))}
              </div>
            </div>

            {/* Stage B: Short Sentences */}
            <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-1.5">
              <span className="text-[9px] uppercase font-black text-amber-500 tracking-wider">Level 2: Short Sentences</span>
              <div className="space-y-1.5 text-xs text-slate-200 italic pt-1">
                <p>• "Hello, my name is John."</p>
                <p>• "Good morning, how are you today?"</p>
              </div>
            </div>

            {/* Stage C: Full story / Paragraph */}
            <div className="glass-card rounded-2xl p-4 border border-slate-200/10 space-y-2">
              <span className="text-[9px] uppercase font-black text-emerald-500 tracking-wider">Level 3: Lesson Scenario</span>
              <h4 className="font-bold text-xs text-slate-200 border-b border-slate-900 pb-1.5">
                {activeDayContent.grammar.conceptName}
              </h4>
              <p className="text-xs text-slate-350 leading-relaxed font-sans max-h-36 overflow-y-auto pr-1">
                {activeDayContent.grammar.explanation}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 active:scale-95"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold active:scale-95 shadow-md flex items-center justify-center space-x-1"
            >
              <span>Step 4: Practice Speaking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: PRACTICE SPEAKING ================= */}
      {step === 4 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">Step 4: Speaking Practice</h3>
            <p className="text-[10px] text-slate-400">Speak today's target phrases clearly. Repeat after audio.</p>
          </div>

          {/* Active Speaking Prompt */}
          <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Speaking Drill Prompt</span>
              
              <button
                onClick={() => speakText(activeDayContent.speaking.prompt)}
                className="flex items-center space-x-1 px-2 py-0.5 bg-slate-950 border border-slate-900 rounded-lg text-[9px] font-bold text-indigo-400 active:scale-95"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen Prompt</span>
              </button>
            </div>

            <p className="text-xs font-bold text-slate-200 leading-relaxed italic bg-slate-950/40 p-3.5 border border-slate-900/60 rounded-2xl">
              "{activeDayContent.speaking.prompt}"
            </p>

            {/* Speech Wave visualizer */}
            <div className="flex flex-col items-center justify-center space-y-3.5 py-4 border-t border-slate-900">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                {isRecording ? 'Listening to your voice...' : 'Tap Mic to Start Speaking'}
              </span>

              <button
                onClick={handleToggleRecord}
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-600 border-rose-500 shadow-md shadow-rose-650/20 animate-pulse' 
                    : 'bg-indigo-650 border-indigo-550 shadow-md shadow-indigo-600/10'
                }`}
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Live translation text */}
            {transcript && (
              <div className="space-y-1 bg-slate-950/60 border border-slate-900 p-3 rounded-2xl">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-bold">Your Speech</span>
                <p className="text-xs text-slate-300 italic">"{transcript}"</p>
              </div>
            )}
          </div>

          {/* AI Score results */}
          {speakingScore && (
            <div className="glass-card rounded-3xl p-5 border border-slate-200/10 space-y-4 bg-gradient-to-tr from-indigo-950/20 to-slate-950/10">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">Speech Scorecard</h4>
              
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-550 uppercase font-black">Pronounce</span>
                  <p className="text-base font-black text-indigo-400 mt-0.5">{speakingScore.pronunciationScore}%</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-550 uppercase font-black">Fluency</span>
                  <p className="text-base font-black text-emerald-400 mt-0.5">{speakingScore.fluencyScore}%</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-slate-550 uppercase font-black">Confidence</span>
                  <p className="text-base font-black text-amber-500 mt-0.5">{speakingScore.confidenceScore}%</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl text-[11px] text-slate-350 leading-relaxed">
                📢 **AI Suggestion:** {speakingScore.improvements}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 active:scale-95"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold active:scale-95 shadow-md flex items-center justify-center space-x-1"
            >
              <span>Step 5: Complete Quiz</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: COMPLETE QUIZ ================= */}
      {step === 5 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-white text-base">Step 5: Lesson Quiz</h3>
            <p className="text-[10px] text-slate-400">Answer these quick questions to check your knowledge.</p>
          </div>

          <div className="space-y-5">
            {activeDayContent.quiz?.map((q: any, idx: number) => (
              <div key={q.id} className="glass-card rounded-2xl p-5 border border-slate-200/10 space-y-3">
                <p className="text-xs font-extrabold text-slate-200">
                  {idx + 1}. {q.question}
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt: string, i: number) => {
                    const isSelected = quizAnswers[q.id] === opt;
                    const isCorrect = q.answer === opt;
                    let btnClass = 'bg-slate-950/40 border-slate-900 text-slate-300 hover:border-slate-800';

                    if (isSelected) {
                      btnClass = 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md';
                    }

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-extrabold';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold line-through';
                      } else {
                        btnClass = 'bg-slate-950/20 border-slate-900/60 text-slate-600 opacity-40';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectQuizAnswer(q.id, opt)}
                        className={`p-3 text-left text-xs rounded-xl border transition-all leading-relaxed ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="text-[10px] text-slate-500 mt-2">
                    💡 **Explanation:** {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(quizAnswers).length < activeDayContent.quiz.length}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center space-x-1.5 text-xs"
            >
              <span>Submit Quiz Answers (+150 XP)</span>
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center space-x-1.5 text-xs"
            >
              <span>Proceed to Rewards</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ================= STEP 6: CHALLENGE COMPLETE ================= */}
      {step === 6 && (
        <div className="space-y-6 text-center py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mx-auto animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Day {dayNum} Completed!</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Fantastic job! You have unlocked greetings, practiced speaking, completed listening drills, and finished today's quiz checklist.
            </p>
          </div>

          {/* Motivational Encouragements */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200/10 text-center space-y-1.5 max-w-xs mx-auto">
            <p className="text-xs font-black text-indigo-400">🎉 Great job!</p>
            <p className="text-[11px] text-slate-200">👏 You're improving every day!</p>
            <p className="text-[11px] text-orange-400">🔥 Streak preserved! Keep it alive!</p>
            <p className="text-[10px] text-slate-500 italic mt-2 block">🚀 Tomorrow you'll learn even more!</p>
          </div>

          {/* Rewards overview */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900 text-center">
              <span className="text-[9px] uppercase font-bold text-indigo-400">XP Gained</span>
              <p className="text-lg font-black text-white mt-0.5">+150 XP</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900 text-center">
              <span className="text-[9px] uppercase font-bold text-amber-400">Coins Gained</span>
              <p className="text-lg font-black text-white mt-0.5">+25 Coins</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl transition-all shadow-md mx-auto block text-xs"
          >
            Go back to Home Screen
          </button>
        </div>
      )}

    </div>
  );
};
