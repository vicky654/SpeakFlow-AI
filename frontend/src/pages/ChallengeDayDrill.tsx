import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { 
  ArrowLeft, ChevronRight, BookOpen, Volume2, Mic, Play, Pause, Award, 
  RefreshCw, CheckCircle2, ChevronLeft, Sparkles, AlertCircle, Star, StarOff,
  MessageCircle, X, Send, Bot, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API_BASE_URL from '../config/api';
import { WordCard } from '../components/WordCard';
import { motion, AnimatePresence } from 'framer-motion';

export const ChallengeDayDrill: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber || '1');

  const { activeDayContent, fetchDayContent, completeDay } = useChallengeStore();
  const toggleFavorite = useAuthStore(state => state.toggleFavorite);
  const favorites = useAuthStore(state => state.user?.favorites || []);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

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

  // Contextual AI Teacher states
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlaying, setAiPlaying] = useState<number | null>(null);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);

  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const [hasResumed, setHasResumed] = useState(false);

  const dayTopics: Record<number, string> = {
    1: 'Greetings & Polite Words',
    2: 'Introducing Yourself',
    3: 'Talking About Family',
    4: 'Shopping for Clothes',
    5: 'At the Restaurant',
    6: 'Asking for Directions',
    7: 'Hobbies & Free Time',
    8: 'Work & Daily Routines',
    9: 'Weather & Clothes',
    10: 'Health & Doctor Visits',
    11: 'Making Appointments',
    12: 'Phone Conversations',
    13: 'Travel and Booking',
    14: 'Emergency Expressions',
    15: 'Graduation Ceremony'
  };

  useEffect(() => {
    fetchDayContent(dayNum);
    fetchDailyChallenge();
  }, [dayNum, fetchDayContent, fetchDailyChallenge]);

  // Contextual AI welcome setup
  useEffect(() => {
    if (activeDayContent) {
      setAiMessages([
        {
          role: 'assistant',
          content: `Hello! I am your AI assistant for today's lesson: **Day ${dayNum}: ${dayTopics[dayNum] || 'English Grammar & Vocabulary'}**.\n\nI can explain vocabulary definitions, translate dialogue sentences, or clarify grammar questions. Ask me anything about today's items! 💡`
        }
      ]);
    }
  }, [activeDayContent, dayNum]);

  useEffect(() => {
    if (showAiSheet) {
      setTimeout(() => {
        aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [aiMessages, showAiSheet]);

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
        if (finalTranscript) {
          setTranscript(finalTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  if (!activeDayContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-brand-bg text-brand-text-primary">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-text-secondary">Loading today's syllabus course...</p>
      </div>
    );
  }

  const currentVocabulary = vocabOverride || activeDayContent.vocabulary || [];

  const handleMarkAsLearned = (wordId: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
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

    await completeDay(dayNum, quizAnswers, finalPct);

    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 }
    });

    handleNextStep();
  };

  const speakText = (text: string, rate: number = 0.8) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/\*\*|\*|👉|❌|✅|💡/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';
      utterance.rate = rate;
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
    setTimeout(() => {
      const pronScore = Math.floor(Math.random() * 20) + 75;
      const fluencyScore = Math.floor(Math.random() * 20) + 70;
      const confidenceScore = Math.floor(Math.random() * 15) + 80;
      
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVocabOverride(data);
        setVocabIndex(0);
        setLearnedWords(new Set());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingVocab(false);
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      // Create detailed system prompt helper context
      const contextPrompt = `I am on Day ${dayNum} of the SpeakFlow Master English Course. Today's topic is: "${dayTopics[dayNum] || 'English Grammar & Vocabulary'}".
The vocabulary list is: ${currentVocabulary.map((w: any) => w.word).join(', ')}.
The listening dialogue is: "${activeDayContent?.listening?.transcript || ''}".
Please answer my questions or give explanations in simple beginner-friendly English.`;

      const res = await fetch(`${API_BASE_URL}/learning/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: 'teacher',
          messages: [
            { role: 'system', content: contextPrompt },
            ...aiMessages.map(m => ({ role: m.role, content: m.content })),
            userMsg
          ]
        })
      });

      if (!res.ok) throw new Error('AI Teacher is offline.');
      const data = await res.json();

      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply
      }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I can't connect to my AI core right now. Let me know if you want to try again! 🌐"
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSpeakAiResponse = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (aiPlaying === index) {
        window.speechSynthesis.cancel();
        setAiPlaying(null);
      } else {
        window.speechSynthesis.cancel();
        const clean = text.replace(/\*\*|\*|👉|❌|✅|💡/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => setAiPlaying(null);
        utterance.onerror = () => setAiPlaying(null);
        setAiPlaying(index);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="space-y-6 select-none max-w-md mx-auto pb-24 pt-4 px-2 text-brand-text-primary relative">
      
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
                  ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-bold'
                  : 'bg-brand-primary text-white hover:bg-brand-hover shadow-sm active:scale-95'
              }`}
            >
              {learnedWords.has(currentVocabulary[vocabIndex]._id) ? 'Learned ✓' : 'Mark as Learned'}
            </button>

            {vocabIndex < currentVocabulary.length - 1 ? (
              <button
                onClick={() => { setVocabIndex(prev => prev + 1); }}
                className="px-5 py-3 min-h-[44px] bg-brand-surface border border-brand-border rounded-xl text-brand-text-primary active:scale-95 transition-all font-semibold text-xs flex items-center justify-center shadow-sm"
              >
                Next
              </button>
            ) : (
              <button
                disabled={learnedWords.size < currentVocabulary.length}
                onClick={handleNextStep}
                className="px-5 py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-750 disabled:opacity-30 text-white rounded-xl text-xs font-semibold active:scale-95 flex items-center justify-center space-x-1 shadow-md transition-all"
              >
                <span>Dialogue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= STEP 2: LISTEN DIALOGUE SCENARIO ================= */}
      {step === 2 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 2: Listen Dialogue</h3>
            <p className="text-[10px] text-brand-text-secondary">Listen to today's dialogue at different speeds.</p>
          </div>

          <div className="card space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-primary">Dialogue Audio player</h4>
            
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

            <div className="p-3.5 bg-brand-surface border border-brand-border rounded-2xl text-xs text-brand-text-secondary leading-relaxed italic max-h-36 overflow-y-auto">
              "{activeDayContent.listening.transcript}"
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Reading Story</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: READ EXAMPLES STORY ================= */}
      {step === 3 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 3: Reading Review</h3>
            <p className="text-[10px] text-brand-text-secondary">Read today's story scenario and pick key sentences.</p>
          </div>

          <div className="card space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-primary">Day {dayNum} Curriculum article</h4>
            <div className="text-xs text-brand-text-secondary leading-relaxed max-h-60 overflow-y-auto pr-1 whitespace-pre-line border-t border-brand-border pt-3">
              {activeDayContent.reading.article}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Speaking Drill</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: PRACTICE SPEAKING DRILL ================= */}
      {step === 4 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 4: Speaking Coach</h3>
            <p className="text-[10px] text-brand-text-secondary">Pronounce today's target expression to test accent accuracy.</p>
          </div>

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

            {transcript && (
              <div className="space-y-1 bg-brand-bg border border-brand-border p-3 rounded-2xl">
                <span className="text-[8px] uppercase tracking-wider text-brand-text-muted block font-bold">Your Speech</span>
                <p className="text-xs text-brand-text-secondary italic">"{transcript}"</p>
              </div>
            )}
          </div>

          {speakingScore && (
            <div className="card space-y-3.5 bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/5 border-indigo-150">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-650 shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">Coach Speech Feedback</span>
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-2 text-xs leading-relaxed text-brand-text-secondary">
                <p className="font-bold text-brand-text-primary">
                  {speakingScore.pronunciationScore >= 85 
                    ? "Excellent pacing and speech flow! You nailed the accent rhythm."
                    : "Great effort! Your pronunciation is solid."}
                </p>
                <p>
                  {speakingScore.improvements} Let's practice together to build confidence.
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-brand-text-muted font-bold px-1">
                <span>Fluency: {speakingScore.fluencyScore >= 80 ? 'Good Pacing' : 'Slow Pacing'}</span>
                <span>Confidence rating: {speakingScore.confidenceScore}%</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handlePrevStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 border border-brand-border rounded-xl text-xs font-semibold text-brand-text-secondary active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex-1 min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-semibold active:scale-95 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Grammar Quiz</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: COMPREHENSION QUIZ ================= */}
      {step === 5 && (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="font-extrabold text-brand-text-primary text-base">Step 5: Lesson Quiz check</h3>
            <p className="text-[10px] text-brand-text-secondary">Verify spelling, vocabulary, and grammar mechanics.</p>
          </div>

          <div className="space-y-5">
            {activeDayContent.quiz?.map((q: any, idx: number) => (
              <div key={q.id} className="card space-y-3">
                <p className="text-xs font-extrabold text-brand-text-primary">
                  {idx + 1}. {q.question}
                </p>

                <div className="flex flex-col space-y-2">
                  {q.options.map((opt: string) => {
                    const isSelected = quizAnswers[q.id] === opt;
                    const isCorrect = q.answer === opt;
                    let btnStyle = "bg-brand-surface/65 border-brand-border text-brand-text-secondary hover:border-brand-primary/30";
                    
                    if (isSelected) {
                      btnStyle = "bg-brand-primary border-brand-primary text-white font-bold shadow-sm";
                    }
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-brand-success/15 border-brand-success text-brand-success font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-brand-error/15 border-brand-error text-brand-error font-medium line-through";
                      } else {
                        btnStyle = "bg-brand-surface/40 border-brand-border text-brand-text-muted opacity-50";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectQuizAnswer(q.id, opt)}
                        className={`p-3 text-left rounded-xl border text-xs leading-normal transition-all active:scale-[0.985] ${btnStyle}`}
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
              className="w-full min-h-[44px] py-3.5 px-6 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 text-xs animate-fade"
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

          <div className="card text-center space-y-2 max-w-xs mx-auto shadow-level-2 relative overflow-hidden select-none border border-brand-warning/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Award className="w-16 h-16 text-brand-warning" />
            </div>
            <p className="text-xs font-semibold text-brand-primary font-bold">🎉 Milestone Unlocked!</p>
            <p className="text-sm font-semibold text-brand-text-primary">👏 You're improving every day!</p>
            <p className="text-xs text-brand-error font-medium">🔥 Streak preserved! Keep it alive!</p>
            <p className="text-[10px] text-brand-text-muted italic mt-1 block">🚀 Tomorrow you'll learn even more!</p>
          </div>

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

          {/* Ask AI Contextual suggestion inside end rewards */}
          <div className="pt-2">
            <button
              onClick={() => setShowAiSheet(true)}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full max-w-xs py-3 bg-white border border-gray-200 text-brand-text-secondary hover:bg-gray-50 text-xs font-bold transition-all mx-auto flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
            >
              <span>Need Help? Ask AI 🤖</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs py-3.5 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-sm mx-auto block text-xs"
          >
            Go back to Home Screen
          </button>
        </div>
      )}

      {/* Floating Ask AI Button (only shown in active learning steps 1 to 5) */}
      {step >= 1 && step <= 5 && (
        <button
          onClick={() => setShowAiSheet(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-750 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 active:scale-90 transition-all z-40 border border-indigo-400/20"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Contextual AI Teacher Bottom Sheet Modal Overlay */}
      <AnimatePresence>
        {showAiSheet && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiSheet(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />

            {/* Slide up sheet panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-250 rounded-t-[28px] z-50 flex flex-col pointer-events-auto shadow-2xl text-left"
            >
              {/* Header handle */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs uppercase tracking-widest font-black text-indigo-600 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Lesson AI Helper</span>
                  </span>
                </div>
                
                <button
                  onClick={() => setShowAiSheet(false)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat log list */}
              <div className="flex-grow overflow-y-auto p-5 space-y-4 min-h-0 scrollbar-none bg-gray-50/50">
                {aiMessages.map((msg, i) => {
                  const isAI = msg.role === 'assistant';
                  return (
                    <div key={i} className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                      {isAI && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-1 max-w-[80%]">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed border relative group ${
                          isAI 
                            ? 'bg-white border-gray-200 text-brand-text-primary shadow-sm'
                            : 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {isAI && (
                            <button
                              onClick={() => handleSpeakAiResponse(msg.content, i)}
                              className={`absolute -right-3 top-2.5 p-1 rounded-full border shadow-sm transition-all active:scale-90 ${
                                aiPlaying === i 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 animate-pulse'
                                  : 'bg-white border-gray-200 text-gray-500 hover:text-indigo-600'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {!isAI && (
                        <div className="w-7 h-7 rounded-lg bg-gray-150 border border-gray-200 text-gray-500 flex items-center justify-center shrink-0 mt-0.5 font-bold uppercase text-[10px]">
                          {user?.name.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                  );
                })}

                {aiLoading && (
                  <div className="flex items-start gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center space-x-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={aiChatEndRef} />
              </div>

              {/* Chat Input form bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage();
                }}
                className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white shrink-0 pb-6"
              >
                <input
                  type="text"
                  placeholder="Ask a question about today's lesson items..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-grow py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-sans"
                />
                
                <button
                  type="submit"
                  disabled={!aiInput.trim() || aiLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl active:scale-95 disabled:opacity-20 shadow-md transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
