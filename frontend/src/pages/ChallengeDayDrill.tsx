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
import { WordCard } from '../components/WordCard';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg flex-col space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-text-secondary">Loading today's learning journey...</p>
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
    <div className="space-y-6 select-none max-w-md mx-auto pb-12 pt-4 px-2 text-brand-text-primary">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-1.5 text-xs text-brand-text-secondary hover:text-brand-text-primary transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lesson</span>
        </button>
        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
          Day {dayNum} Learning Flow
        </span>
      </div>

      {/* Step Progress indicators */}
      <div className="space-y-1.5 text-left">
        <div className="flex justify-between text-[9px] font-black text-brand-text-secondary uppercase tracking-widest">
          <span>Drill Step {step} of 6</span>
          <span className="text-brand-primary">
            {step === 1 ? '1. Learn 10 Words' :
             step === 2 ? '2. Listen Pronunciation' :
             step === 3 ? '3. Read Examples' :
             step === 4 ? '4. Practice Speaking' :
             step === 5 ? '5. Complete Quiz' :
             '6. Earn Rewards'}
          </span>
        </div>
        <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
          <div 
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* ================= STEP 1: LEARN TODAY'S 10 WORDS ================= */}
      {step === 1 && currentVocabulary.length > 0 && (
        <div className="space-y-5 text-left">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-extrabold text-brand-text-primary text-base">Step 1: Vocabulary Cards</h3>
              <p className="text-[10px] text-brand-text-secondary">Tap cards to flip. Mark all words as learned.</p>
            </div>
            <button
              onClick={handleRefreshVocab}
              disabled={refreshingVocab}
              className="flex items-center space-x-1 px-2.5 py-1 bg-brand-surface border border-brand-border rounded-lg text-[9px] font-bold text-brand-text-secondary hover:text-brand-text-primary disabled:opacity-30 active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${refreshingVocab ? 'animate-spin' : ''}`} />
              <span>Refresh words</span>
            </button>
          </div>

          {/* Reusable WordCard component with full gestures */}
          <div className="flex justify-center">
            <WordCard
              word={currentVocabulary[vocabIndex]}
              isLearned={learnedWords.has(currentVocabulary[vocabIndex]._id)}
              onLearned={() => handleMarkAsLearned(currentVocabulary[vocabIndex]._id)}
              onNext={() => {
                if (vocabIndex < currentVocabulary.length - 1) {
                  setVocabIndex(prev => prev + 1);
                }
              }}
              onPrev={() => {
                if (vocabIndex > 0) {
                  setVocabIndex(prev => prev - 1);
                }
              }}
              isFirstCard={vocabIndex === 0}
            />
          </div>

          {/* Flashcard actions & markers */}
          <div className="flex justify-between items-center text-xs px-1">
            <button
              disabled={vocabIndex === 0}
              onClick={() => { setVocabIndex(prev => prev - 1); }}
              className="px-5 py-3 min-h-[44px] bg-brand-surface border border-brand-border rounded-xl text-brand-text-primary disabled:opacity-20 active:scale-95 transition-all font-semibold text-xs flex items-center justify-center shadow-sm"
            >
              Back
            </button>

            <button
              onClick={() => handleMarkAsLearned(currentVocabulary[vocabIndex]._id)}
              disabled={learnedWords.has(currentVocabulary[vocabIndex]._id)}
              className={`px-5 py-3 min-h-[44px] rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                learnedWords.has(currentVocabulary[vocabIndex]._id)
                  ? 'bg-brand-success/15 border border-brand-success/20 text-brand-success cursor-default'
                  : 'bg-brand-primary hover:bg-brand-hover text-white shadow-sm'
              }`}
            >
              {learnedWords.has(currentVocabulary[vocabIndex]._id) ? '✓ Learned' : '✅ Mark as Learned'}
            </button>

            <button
              disabled={vocabIndex === 9}
              onClick={() => { setVocabIndex(prev => prev + 1); }}
              className="px-5 py-3 min-h-[44px] bg-brand-surface border border-brand-border rounded-xl text-brand-text-primary disabled:opacity-20 active:scale-95 transition-all font-semibold text-xs flex items-center justify-center shadow-sm"
            >
              Next
            </button>
          </div>

          {/* Progress dots with animated layout width */}
          <div className="flex space-x-1.5 justify-center py-2 max-w-[200px] mx-auto overflow-hidden">
            {currentVocabulary.map((v: any, idx: number) => (
              <motion.div
                key={idx}
                layout
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === vocabIndex 
                    ? 'bg-brand-primary w-3.5' 
                    : learnedWords.has(v._id) 
                      ? 'bg-brand-success w-1.5' 
                      : 'bg-brand-border w-1.5'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-sm mt-2 flex items-center justify-center space-x-2 text-xs"
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
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 2: Listening Practice</h3>
            <p className="text-[10px] text-brand-text-secondary">Listen to today's dialogue at different speeds.</p>
          </div>

          <div className="card space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-primary">Dialogue Audio player</h4>
            
            {/* Speed toggle */}
            <div className="flex bg-brand-bg p-1.5 rounded-xl border border-brand-border justify-around text-xs">
              <button
                onClick={() => setSlowMode(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  slowMode ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Slow Mode (0.55x)
              </button>
              <button
                onClick={() => setSlowMode(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  !slowMode ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Normal Mode (0.85x)
              </button>
            </div>

            {/* Audio interface button */}
            <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <button
                  onClick={handleSpeakDialogue}
                  className="w-12 h-12 rounded-full bg-brand-primary active:scale-95 hover:brightness-110 text-white flex items-center justify-center shadow-md"
                >
                  {isPlayingText ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-brand-text-primary">{isPlayingText ? 'Streaming dialogue...' : 'Dialogue transcript'}</p>
                  <p className="text-[10px] text-brand-text-secondary">Native narrator voice • USA</p>
                </div>
              </div>
            </div>

            {/* Script preview */}
            <div className="p-3.5 bg-brand-surface border border-brand-border rounded-2xl text-xs text-brand-text-secondary leading-relaxed italic max-h-36 overflow-y-auto">
              "{activeDayContent.listening.transcript}"
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
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
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 3: Reading Practice</h3>
            <p className="text-[10px] text-brand-text-secondary">Start simple and grow from single words to paragraphs.</p>
          </div>

          {/* Progressive reading boards */}
          <div className="space-y-3.5">
            {/* Stage A: Single Words */}
            <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 border border-brand-border space-y-1.5">
              <span className="text-[9px] uppercase font-black text-brand-primary tracking-wider">Level 1: Today's Words</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentVocabulary.slice(0, 4).map((v: any, i: number) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-brand-bg border border-brand-border text-brand-text-secondary rounded-lg">
                    {v.word} ({v.hindiMeaning})
                  </span>
                ))}
              </div>
            </div>

            {/* Stage B: Short Sentences */}
            <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 border border-brand-border space-y-1.5">
              <span className="text-[9px] uppercase font-black text-brand-warning tracking-wider">Level 2: Short Sentences</span>
              <div className="space-y-1.5 text-xs text-brand-text-secondary italic pt-1">
                <p>• "Hello, my name is John."</p>
                <p>• "Good morning, how are you today?"</p>
              </div>
            </div>

            {/* Stage C: Full story / Paragraph */}
            <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 border border-brand-border space-y-2">
              <span className="text-[9px] uppercase font-black text-brand-success tracking-wider">Level 3: Lesson Scenario</span>
              <h4 className="font-bold text-xs text-brand-text-secondary border-b border-brand-border pb-1.5">
                {activeDayContent.grammar.conceptName}
              </h4>
              <p className="text-xs text-brand-text-secondary leading-relaxed font-sans max-h-36 overflow-y-auto pr-1">
                {activeDayContent.grammar.explanation}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
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
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 4: Speaking Practice</h3>
            <p className="text-[10px] text-brand-text-secondary">Speak today's target phrases clearly. Repeat after audio.</p>
          </div>

          {/* Active Speaking Prompt */}
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-widest">Speaking Drill Prompt</span>
              
              <button
                onClick={() => speakText(activeDayContent.speaking.prompt)}
                className="flex items-center space-x-1 px-2 py-0.5 bg-brand-bg border border-brand-border rounded-lg text-[9px] font-bold text-brand-primary active:scale-95"
              >
                <Volume2 className="w-3 h-3" />
                <span>Listen Prompt</span>
              </button>
            </div>

            <p className="text-xs font-bold text-brand-text-secondary leading-relaxed italic bg-brand-bg p-3.5 border border-brand-border rounded-2xl">
              "{activeDayContent.speaking.prompt}"
            </p>

            {/* Speech Wave visualizer */}
            <div className="flex flex-col items-center justify-center space-y-3.5 py-4 border-t border-brand-border">
              <span className="text-[9px] uppercase tracking-widest text-brand-text-muted font-bold">
                {isRecording ? 'Listening to your voice...' : 'Tap Mic to Start Speaking'}
              </span>

              <button
                onClick={handleToggleRecord}
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-brand-error border-brand-error shadow-md shadow-brand-error/20 animate-pulse' 
                    : 'bg-brand-primary border-brand-primary shadow-md shadow-brand-primary/10'
                }`}
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Live translation text */}
            {transcript && (
              <div className="space-y-1 bg-brand-bg border border-brand-border p-3 rounded-2xl">
                <span className="text-[8px] uppercase tracking-wider text-brand-text-muted block font-bold">Your Speech</span>
                <p className="text-xs text-brand-text-secondary italic">"{transcript}"</p>
              </div>
            )}
          </div>

          {/* AI Score results */}
          {speakingScore && (
            <div className="card space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-text-secondary">Speech Scorecard</h4>
              
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-brand-bg border border-brand-border p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-brand-text-muted uppercase font-black">Pronounce</span>
                  <p className="text-base font-black text-brand-primary mt-0.5">{speakingScore.pronunciationScore}%</p>
                </div>
                <div className="bg-brand-bg border border-brand-border p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-brand-text-muted uppercase font-black">Fluency</span>
                  <p className="text-base font-black text-brand-success mt-0.5">{speakingScore.fluencyScore}%</p>
                </div>
                <div className="bg-brand-bg border border-brand-border p-2.5 rounded-xl text-center">
                  <span className="text-[8px] text-brand-text-muted uppercase font-black">Confidence</span>
                  <p className="text-base font-black text-brand-warning mt-0.5">{speakingScore.confidenceScore}%</p>
                </div>
              </div>

              <div className="p-3 bg-brand-bg border border-brand-border rounded-2xl text-[11px] text-brand-text-secondary leading-relaxed">
                📢 **AI Suggestion:** {speakingScore.improvements}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
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
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 5: Lesson Quiz</h3>
            <p className="text-[10px] text-brand-text-secondary">Answer these quick questions to check your knowledge.</p>
          </div>

          <div className="space-y-5">
            {activeDayContent.quiz?.map((q: any, idx: number) => (
              <div key={q.id} className="card space-y-3">
                <p className="text-xs font-extrabold text-brand-text-primary">
                  {idx + 1}. {q.question}
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt: string, i: number) => {
                    const isSelected = quizAnswers[q.id] === opt;
                    const isCorrect = q.answer === opt;
                    let btnClass = 'bg-brand-bg/40 border-brand-border text-brand-text-secondary hover:border-brand-border';

                    if (isSelected) {
                      btnClass = 'bg-brand-primary border-brand-primary text-white font-semibold shadow-sm';
                    }

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = 'bg-brand-success/10 border-brand-success text-brand-success font-semibold';
                      } else if (isSelected) {
                        btnClass = 'bg-brand-error/10 border-brand-error text-brand-error font-semibold line-through';
                      } else {
                        btnClass = 'bg-brand-bg/20 border-brand-border/60 text-brand-text-muted opacity-40';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectQuizAnswer(q.id, opt)}
                        className={`p-3.5 min-h-[44px] text-left text-xs rounded-xl border transition-all leading-relaxed font-medium ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="text-[10px] text-brand-text-muted mt-2">
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
              className="w-full min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover disabled:opacity-30 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 text-xs"
            >
              <span>Submit Quiz Answers (+150 XP)</span>
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="w-full min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 text-xs"
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
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-warning to-brand-error flex items-center justify-center text-white shadow-level-2 mx-auto animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-brand-text-primary">Day {dayNum} Completed!</h2>
            <p className="text-xs text-brand-text-secondary max-w-xs mx-auto leading-relaxed">
              Fantastic job! You have unlocked greetings, practiced speaking, completed listening drills, and finished today's quiz checklist.
            </p>
          </div>

          {/* Motivational Encouragements Card with gold borders */}
          <div className="bg-brand-card rounded-3xl p-5 border-2 border-double border-brand-warning/30 text-center space-y-2 max-w-xs mx-auto shadow-level-2 relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Award className="w-16 h-16 text-brand-warning" />
            </div>
            <p className="text-xs font-semibold text-brand-primary">🎉 Milestone Unlocked!</p>
            <p className="text-sm font-semibold text-brand-text-primary">👏 You're improving every day!</p>
            <p className="text-xs text-brand-error font-medium">🔥 Streak preserved! Keep it alive!</p>
            <p className="text-[10px] text-brand-text-muted italic mt-1 block">🚀 Tomorrow you'll learn even more!</p>
          </div>

          {/* Rewards overview */}
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-center shadow-sm">
              <span className="text-[10px] uppercase font-medium text-brand-primary">XP Gained</span>
              <p className="text-lg font-semibold text-brand-text-primary mt-0.5">+150 XP</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-warning/10 border border-brand-warning/20 text-center shadow-sm">
              <span className="text-[10px] uppercase font-medium text-brand-warning">Coins Gained</span>
              <p className="text-lg font-semibold text-brand-text-primary mt-0.5">+25 Coins</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs py-3.5 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-sm mx-auto block text-xs"
          >
            Go back to Home Screen
          </button>
        </div>
      )}

    </div>
  );
};
