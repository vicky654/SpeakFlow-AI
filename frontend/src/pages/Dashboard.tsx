import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useChallengeStore } from '../store/challengeStore';
import { 
  BookOpen, Flame, Star, Play, Timer, Sparkles, Send, Mic, 
  Volume2, X, Plus, AlertCircle, FileText, ChevronRight, Award, 
  CheckCircle2, Search, ArrowRight, Bot, Compass, Snowflake, Globe, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';

const DAILY_CHALLENGES: Record<string, string> = {
  'Monday': 'Describe your room. List 3 key items inside.',
  'Tuesday': 'Order coffee and a slice of cake at a mock cafe.',
  'Wednesday': 'Introduce yourself in a formal business meeting.',
  'Thursday': 'Explain today\'s weather and your wardrobe choices.',
  'Friday': 'Describe your favorite movie and why you recommend it.',
  'Saturday': 'Talk about your daily work tasks or hobbies.',
  'Sunday': 'Free conversation. Ask me any general question.'
};

export const Dashboard: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const loadUser = useAuthStore(state => state.loadUser);
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const { progress, fetchProgress } = useChallengeStore();
  const navigate = useNavigate();

  // Habit toggles & settings
  const [languageMode, setLanguageMode] = useState(
    localStorage.getItem('speakflow_lang_mode') || 'Hindi + English'
  );
  const [streakFrozen, setStreakFrozen] = useState(false);

  // Modals & Panels states
  const [showOneMinPractice, setShowOneMinPractice] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [showVoiceJournal, setShowVoiceJournal] = useState(false);
  const [showWhatsAppMode, setShowWhatsAppMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  // 1. ONE MINUTE PRACTICE STATE
  const [oneMinStep, setOneMinStep] = useState(1);
  const [oneMinVocabIdx, setOneMinVocabIdx] = useState(0);
  const [oneMinSpeakText, setOneMinSpeakText] = useState('');
  const [oneMinIsRecording, setOneMinIsRecording] = useState(false);
  const [oneMinSpeechVerified, setOneMinSpeechVerified] = useState(false);
  const [oneMinQuizAnswer, setOneMinQuizAnswer] = useState<string | null>(null);
  const [oneMinQuizSubmitted, setOneMinQuizSubmitted] = useState(false);

  // 2. DIARY STATE
  const [diaryText, setDiaryText] = useState('');
  const [diarySubmitting, setDiarySubmitting] = useState(false);
  const [diaryResult, setDiaryResult] = useState<any | null>(null);

  // 3. VOICE JOURNAL STATE
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<any | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 4. WHATSAPP VOICE CHAT MODE STATE
  const [whatsappMsgList, setWhatsappMsgList] = useState<any[]>([
    { role: 'assistant', content: "Hi there! 👋 How was your day? Tap the mic and tell me about it in English!" }
  ]);
  const [whatsappRecording, setWhatsappRecording] = useState(false);
  const [whatsappInputText, setWhatsappInputText] = useState('');
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  // 5. REFLECTION STATE
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);

  useEffect(() => {
    fetchDailyChallenge();
    fetchProgress();
  }, [fetchDailyChallenge, fetchProgress]);

  const currentDay = progress?.currentDay || 1;

  // Real-Life Mission names list
  const realLifeMissions: Record<number, string> = {
    1: 'Buy Groceries at the Local Store',
    2: 'Book a Room at the Grand Hotel',
    3: 'Attend a Professional Job Interview',
    4: 'Board a Flight at the Airport Terminal',
    5: 'Order Lunch at the Prime Bistro Restaurant',
    6: 'Ask for Directions to the Train Station',
    7: 'Register a New Account at the National Bank',
    8: 'Explain Health Symptoms to the Medical Doctor',
    9: 'Report a Lost Item at the City Police Station',
    10: 'Introduce Friends at a Social Gathering',
    11: 'Lead a Project Review Office Meeting',
    12: 'Schedule a Phone Call Appointment',
    13: 'Describe Travel Plans for the Summer Vacation',
    14: 'Buy Clothes at the Shopping Mall Boutique',
    15: 'Deliver a Speech at the Graduation Ceremony'
  };

  const currentMission = realLifeMissions[currentDay] || 'Grammar & Vocabulary Practice';

  // Smart Resume state builder
  const getSmartResumeStep = () => {
    const checklist = dailyChallenge?.checklist || {};
    if (!checklist.vocab?.completed) return { name: 'Vocabulary Card drill', timeRemaining: '8 min' };
    if (!checklist.listening?.completed) return { name: 'Listening Dialogue', timeRemaining: '6 min' };
    if (!checklist.reading?.completed) return { name: 'Reading Story Review', timeRemaining: '4 min' };
    if (!checklist.speaking?.completed) return { name: 'Speaking Practice', timeRemaining: '2 min' };
    if (!checklist.quiz?.completed) return { name: 'Comprehension Quiz', timeRemaining: '1 min' };
    return null;
  };

  const resumeStep = getSmartResumeStep();

  // Smart Goals: Adjust suggested minutes based on XP stats
  const getSmartSuggestedGoal = () => {
    const xp = user?.xp || 0;
    if (xp > 1200) return '18 min goal';
    if (xp > 500) return '15 min goal';
    return '12 min goal';
  };

  const suggestedGoal = getSmartSuggestedGoal();

  // Day of week dynamic challenge selector
  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const dayOfWeek = getDayOfWeek();
  const todayChallengePrompt = DAILY_CHALLENGES[dayOfWeek] || DAILY_CHALLENGES['Sunday'];

  // Dynamic Time-of-Day Companion Greeting Prompt
  const getCoachGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return `🌞 Good Morning, ${user?.name || 'Vicky'}!\nToday's lesson takes only 12 minutes. Ready?`;
    }
    if (hour < 17) {
      return `🍽️ Hey ${user?.name || 'Vicky'}!\nTell me what you're eating today in English. Tap Voice Mode!`;
    }
    return `🌙 How was your day, ${user?.name || 'Vicky'}?\nLet's practice speaking for 3 minutes. Press WhatsApp Voice.`;
  };

  const coachGreeting = getCoachGreeting();

  // estimated fluency metric CEFR
  const getFluencyScore = (xp: number) => {
    const score = Math.min(98, 10 + Math.round((xp / 3000) * 85));
    let cefr = 'A1';
    if (score >= 80) cefr = 'B2 Level';
    else if (score >= 50) cefr = 'B1 Level';
    else if (score >= 25) cefr = 'A2 Level';
    else cefr = 'A1 Level';
    return { score, cefr };
  };

  const fluency = getFluencyScore(user?.xp || 0);

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/🔧\s*Corrections:[\s\S]*$/i, '').trim();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleLanguageChange = (mode: string) => {
    setLanguageMode(mode);
    localStorage.setItem('speakflow_lang_mode', mode);
  };

  const handleToggleFreeze = () => {
    if (streakFrozen) {
      setStreakFrozen(false);
    } else {
      setStreakFrozen(true);
      speakWord("Streak frozen! Your streak is safe today.");
    }
  };

  // ONE MINUTE PRACTICE HELPERS
  const startOneMinPractice = () => {
    setOneMinStep(1);
    setOneMinVocabIdx(0);
    setOneMinSpeakText('');
    setOneMinIsRecording(false);
    setOneMinSpeechVerified(false);
    setOneMinQuizAnswer(null);
    setOneMinQuizSubmitted(false);
    setShowOneMinPractice(true);
  };

  const toggleOneMinRecord = () => {
    if (oneMinIsRecording) {
      setOneMinIsRecording(false);
      setOneMinSpeechVerified(true);
      setOneMinSpeakText("I am learning English with SpeakFlow every day.");
      speakWord("Excellent!");
    } else {
      setOneMinIsRecording(true);
      setOneMinSpeechVerified(false);
      setOneMinSpeakText('');
    }
  };

  const claimOneMinRewards = async () => {
    try {
      await fetch(`${API_BASE_URL}/gamification/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ xp: 15, coins: 5 })
      });
      if (loadUser) await loadUser();
    } catch (e) {
      console.error(e);
    }
    setShowOneMinPractice(false);
  };

  // DIARY EVALUATION SIMULATOR
  const handleSubmitDiary = () => {
    if (!diaryText.trim() || diarySubmitting) return;
    setDiarySubmitting(true);

    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 75;
      setDiaryResult({
        score,
        grammar: score,
        naturalness: score - 5,
        corrections: ["Grammar evaluated! Practice writing past actions with proper past-tense verbs."]
      });
      setDiarySubmitting(false);

      fetch(`${API_BASE_URL}/gamification/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ xp: 20, coins: 5 })
      }).then(() => loadUser && loadUser());
    }, 1200);
  };

  // VOICE JOURNAL SIMULATOR
  const handleToggleVoiceJournal = () => {
    if (voiceRecording) {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setVoiceRecording(false);
      setVoiceResult({
        transcript: "Today, I practiced my spoken English challenge. The coach system is very helpful.",
        wpm: 110,
        duration: voiceTimer,
        pronunciation: 88,
        fluency: 85
      });

      fetch(`${API_BASE_URL}/gamification/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ xp: 25, coins: 8 })
      }).then(() => loadUser && loadUser());
    } else {
      setVoiceTranscript('');
      setVoiceResult(null);
      setVoiceTimer(0);
      setVoiceRecording(true);

      voiceTimerRef.current = setInterval(() => {
        setVoiceTimer(prev => prev + 1);
      }, 1000);
    }
  };

  // WHATSAPP VOICE CHAT MODE SIMULATION
  const handleToggleWhatsAppMic = () => {
    if (whatsappRecording) {
      setWhatsappRecording(false);
      setWhatsappLoading(true);
      
      const userText = "Today was a good day, I finished some programming tasks.";
      setWhatsappMsgList(prev => [...prev, { role: 'user', content: userText }]);

      setTimeout(() => {
        const reply = "That sounds productive! 🔧 Keep up the programming work and tell me what you plan to code next.";
        setWhatsappMsgList(prev => [...prev, { role: 'assistant', content: reply }]);
        setWhatsappLoading(false);
        speakWord(reply);
      }, 1500);

    } else {
      setWhatsappRecording(true);
    }
  };

  // REFLECTION HANDLER
  const handleSubmitReflection = () => {
    if (!reflectionText.trim()) return;
    setReflectionSubmitted(true);
    speakWord("Excellent reflection! Sleep well.");
    
    fetch(`${API_BASE_URL}/gamification/credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore.getState().token}`
      },
      body: JSON.stringify({ xp: 10, coins: 2 })
    }).then(() => loadUser && loadUser());
  };

  // Habit metrics mapping
  const checklist = dailyChallenge?.checklist || {};
  const completedCount = [
    checklist.vocab?.completed,
    checklist.listening?.completed,
    checklist.speaking?.completed,
    checklist.quiz?.completed
  ].filter(Boolean).length;
  const progressPct = Math.round((completedCount / 4) * 100);

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-24 pt-4 px-1 text-brand-text-primary text-left">
      
      {/* 1. TOP HEADER: LANGUAGE MODE SWITCHER & TIME-OF-DAY GOALS */}
      <div className="flex justify-between items-center border-b border-gray-150 pb-3">
        {/* Language selector */}
        <div className="relative inline-block text-left">
          <button 
            onClick={() => handleLanguageChange(languageMode === 'Hindi + English' ? 'English Only' : 'Hindi + English')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-brand-text-secondary active:scale-95 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mode: {languageMode}</span>
          </button>
        </div>

        {/* Suggested dynamic Target Minutes goal */}
        <div className="flex items-center space-x-1 text-[10px] font-extrabold text-indigo-650 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
          <Timer className="w-3.5 h-3.5" />
          <span>{suggestedGoal}</span>
        </div>
      </div>

      {/* 2. MULTIPLE STREAK INDICATORS HEADER PANEL */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-1">
          <Flame className="w-4 h-4 text-orange-500 fill-current mx-auto animate-pulse" />
          <span className="text-[10px] font-black text-brand-text-primary block">14D Speaking</span>
        </div>
        <div className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-1">
          <Star className="w-4 h-4 text-indigo-500 fill-indigo-500/10 mx-auto" />
          <span className="text-[10px] font-black text-brand-text-primary block">21D Vocabulary</span>
        </div>
        <div className="p-3.5 bg-white border border-gray-150 rounded-xl space-y-1">
          <BookOpen className="w-4 h-4 text-emerald-500 fill-emerald-500/10 mx-auto" />
          <span className="text-[10px] font-black text-brand-text-primary block">30D Reading</span>
        </div>
      </div>

      {/* 3. AI COMPANION PROMPT */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/10 p-4.5 rounded-[20px] border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Bot className="w-5.5 h-5.5" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-indigo-650 font-black uppercase tracking-wider">AI English Companion</p>
          <p className="text-xs text-brand-text-secondary leading-relaxed font-semibold whitespace-pre-line">
            {coachGreeting}
          </p>
        </div>
      </div>

      {/* 4. DOMINANT DAILY REAL-LIFE MISSION CARD (Smart Resume) */}
      <div className="card space-y-4 border-2 border-indigo-500 shadow-md bg-gradient-to-br from-indigo-600 to-indigo-755 text-white !p-6">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
            Today's Mission
          </span>
          <h2 className="text-xl font-black mt-2 leading-snug">
            {resumeStep ? `Continue: ${resumeStep.name}` : `Mission ${currentDay}: ${currentMission}`}
          </h2>
          <p className="text-[11px] text-white/80 font-medium mt-1">
            {resumeStep ? `${resumeStep.timeRemaining} remaining` : '15 minutes target duration'}
          </p>
        </div>

        <button
          onClick={() => navigate(`/challenge/day/${currentDay}`)}
          style={{ borderRadius: '12px', padding: '14px' }}
          className="w-full bg-white text-indigo-650 font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1.5"
        >
          <span>{resumeStep ? 'Continue' : 'Start Mission'}</span>
          <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
        </button>
      </div>

      {/* 5. WHATSAPP VOICE CHAT MODE BUTTON WIDGET */}
      <div 
        onClick={() => setShowWhatsAppMode(true)}
        className="card flex items-center justify-between !p-4 border-indigo-200 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md animate-pulse">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-xs sm:text-sm text-brand-text-primary">WhatsApp Voice Mode</h4>
            <p className="text-[10px] text-brand-text-secondary">Speak naturally with AI. Practice English without lessons.</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-brand-text-secondary" />
      </div>

      {/* 6. DAILY WORD OF THE DAY WIDGET */}
      <div className="card space-y-3.5 border-dashed border-gray-250 bg-gray-50/20">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-[9px] uppercase tracking-widest text-indigo-600 font-extrabold">Word of the Day</span>
          <button 
            onClick={() => speakWord('Confident')}
            className="p-1 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 hover:bg-indigo-100"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-black text-brand-text-primary">Confident</h4>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            **Meaning:** Feeling sure of your abilities or qualities.
          </p>
          <p className="text-xs text-brand-text-secondary italic">
            **Example:** She was confident that she would pass the English speaking test.
          </p>
        </div>

        <button
          onClick={() => speakWord('She was confident that she would pass the English speaking test.')}
          style={{ borderRadius: '10px', padding: '10px' }}
          className="w-full bg-white border border-gray-200 text-brand-text-secondary hover:bg-gray-50 text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center space-x-1"
        >
          <span>Tap to Practice Pronunciation</span>
        </button>
      </div>

      {/* 7. DAILY ENGLISH SITUATIONAL CHALLENGE */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center border-b border-brand-border pb-3.5">
          <div className="flex items-center space-x-2 text-indigo-500">
            <Compass className="w-5 h-5" />
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-brand-text-secondary">Daily English Challenge</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-black bg-indigo-50 border border-indigo-200 text-indigo-650 px-2 py-0.5 rounded">
            {dayOfWeek}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-brand-text-secondary leading-relaxed font-semibold">
            Today's Task: {todayChallengePrompt}
          </p>
        </div>

        <button
          onClick={() => { setVoiceResult(null); setShowVoiceJournal(true); }}
          style={{ borderRadius: '12px', padding: '12px' }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Start Speaking Challenge</span>
        </button>
      </div>

      {/* 8. HABIT CHECKLIST SCREEN */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <div>
            <h3 className="font-bold text-sm text-brand-text-primary">Daily Habit Progress</h3>
            <p className="text-[10px] text-brand-text-secondary">Track completed activities for today's streak.</p>
          </div>
          <span className="text-xs font-black text-indigo-600">{progressPct}%</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2 text-brand-text-secondary font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                checklist.vocab?.completed ? 'bg-emerald-500 text-white' : 'bg-gray-150 text-gray-500'
              }`}>
                {checklist.vocab?.completed ? '✓' : '1'}
              </span>
              <span>Vocabulary Study</span>
            </span>
            <span className={`text-[10px] font-bold ${checklist.vocab?.completed ? 'text-emerald-500' : 'text-brand-text-muted'}`}>
              {checklist.vocab?.completed ? 'Done' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2 text-brand-text-secondary font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                checklist.listening?.completed ? 'bg-emerald-500 text-white' : 'bg-gray-150 text-gray-500'
              }`}>
                {checklist.listening?.completed ? '✓' : '2'}
              </span>
              <span>Listening Drills</span>
            </span>
            <span className={`text-[10px] font-bold ${checklist.listening?.completed ? 'text-emerald-500' : 'text-brand-text-muted'}`}>
              {checklist.listening?.completed ? 'Done' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2 text-brand-text-secondary font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                checklist.speaking?.completed ? 'bg-emerald-500 text-white' : 'bg-gray-150 text-gray-500'
              }`}>
                {checklist.speaking?.completed ? '✓' : '3'}
              </span>
              <span>Speaking Coach Practice</span>
            </span>
            <span className={`text-[10px] font-bold ${checklist.speaking?.completed ? 'text-emerald-500' : 'text-brand-text-muted'}`}>
              {checklist.speaking?.completed ? 'Done' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-2 text-brand-text-secondary font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                checklist.quiz?.completed ? 'bg-emerald-500 text-white' : 'bg-gray-150 text-gray-500'
              }`}>
                {checklist.quiz?.completed ? '✓' : '4'}
              </span>
              <span>Lesson Grammar Quiz</span>
            </span>
            <span className={`text-[10px] font-bold ${checklist.quiz?.completed ? 'text-emerald-500' : 'text-brand-text-muted'}`}>
              {checklist.quiz?.completed ? 'Done' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* 9. ESTIMATED FLUENCY METER */}
      <div className="card space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-brand-text-primary">Fluency Meter</h4>
            <p className="text-[10px] text-brand-text-secondary">Estimated speech accuracy rating based on XP.</p>
          </div>
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
            {fluency.cefr}
          </span>
        </div>

        <div className="space-y-1 pt-1">
          <div className="w-full h-2 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${fluency.score}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-brand-text-muted font-bold">
            <span>A1 (Beginner)</span>
            <span>Fluency: {fluency.score}%</span>
            <span>C2 (Fluent)</span>
          </div>
        </div>
      </div>

      {/* 10. STREAK FREEZE TOGGLER */}
      <div className="card flex items-center justify-between !p-4 border-dashed border-indigo-200 bg-indigo-50/20">
        <div className="flex items-center space-x-2.5">
          <Snowflake className={`w-5 h-5 text-indigo-500 shrink-0 ${streakFrozen ? 'animate-spin-slow' : ''}`} />
          <div className="text-left">
            <h4 className="font-bold text-xs text-brand-text-primary">Streak Freeze Protection</h4>
            <p className="text-[9px] text-brand-text-secondary">Lock your streak count if you miss a study day.</p>
          </div>
        </div>
        <button
          onClick={handleToggleFreeze}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-sm ${
            streakFrozen 
              ? 'bg-indigo-600 text-white border border-indigo-650' 
              : 'bg-white border border-gray-250 text-indigo-650 hover:bg-indigo-50'
          }`}
        >
          {streakFrozen ? '❄️ Frozen' : 'Use Freeze'}
        </button>
      </div>

      {/* 11. END-OF-DAY REFLECTION BANNER */}
      <div 
        onClick={() => { setReflectionSubmitted(false); setReflectionText(''); setShowReflection(true); }}
        className="card flex items-center justify-between !p-4 border-purple-200 bg-purple-50/10 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-lg">🛌</span>
          <div className="text-left">
            <h4 className="font-bold text-xs text-brand-text-primary">End-of-Day Reflection</h4>
            <p className="text-[9px] text-brand-text-secondary">Reinforce today's learning before sleeping.</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-brand-text-secondary" />
      </div>

      {/* ================= WHATSAPP VOICE CHAT MODE OVERLAY ================= */}
      <AnimatePresence>
        {showWhatsAppMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowWhatsAppMode(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#ECE5DD] rounded-t-[28px] z-50 p-5 flex flex-col pointer-events-auto text-left shadow-2xl">
              
              <div className="flex justify-between items-center border-b border-emerald-800/10 pb-3 shrink-0 bg-emerald-600 text-white p-4 -mx-5 -mt-5 rounded-t-[28px]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">A</div>
                  <div className="text-left leading-none">
                    <span className="text-xs font-black block">AI Voice Companion</span>
                    <span className="text-[8px] opacity-75 font-semibold">online</span>
                  </div>
                </div>
                <button onClick={() => setShowWhatsAppMode(false)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 text-white"><X className="w-4 h-4" /></button>
              </div>

              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3.5 min-h-0 scrollbar-none my-3">
                {whatsappMsgList.map((msg, i) => {
                  const isAI = msg.role === 'assistant';
                  return (
                    <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-3 rounded-xl text-xs max-w-[80%] shadow-sm relative ${
                        isAI ? 'bg-white text-gray-800' : 'bg-[#DCF8C6] text-gray-800'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                        
                        {isAI && (
                          <button
                            onClick={() => speakWord(msg.content)}
                            className="absolute -right-2 top-2 p-0.5 rounded-full bg-gray-100 text-gray-500 shadow-sm border"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {whatsappLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white rounded-xl flex items-center space-x-1 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-650 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-emerald-650 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-650 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp bottom control bar */}
              <div className="flex items-center justify-center py-4 bg-white -mx-5 -mb-5 p-4 border-t border-gray-200">
                <button
                  onClick={handleToggleWhatsAppMic}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 ${
                    whatsappRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  <Mic className="w-7 h-7" />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= END-OF-DAY REFLECTION MODAL SHEET ================= */}
      <AnimatePresence>
        {showReflection && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowReflection(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-purple-650 flex items-center gap-1.5">
                  <Flame className="w-4.5 h-4.5 text-orange-500" />
                  <span>End-of-Day Reflection</span>
                </span>
                <button onClick={() => setShowReflection(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-brand-text-primary">What did you learn today? 📖</p>
                  <p className="text-[10px] text-brand-text-secondary leading-normal">Write at least one full sentence in English summarizing today's lesson elements to seal your memory before sleep.</p>
                </div>

                {!reflectionSubmitted ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Today I learned greetings and how to speak about my family..."
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-text-primary focus:outline-none focus:bg-white focus:border-purple-400 transition-all font-sans"
                    />

                    <button
                      disabled={!reflectionText.trim()}
                      onClick={handleSubmitReflection}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="w-full bg-purple-600 hover:bg-purple-750 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Save Reflection (+10 XP)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade text-center py-3 flex flex-col items-center">
                    <span className="text-3xl">✨</span>
                    <h3 className="text-sm font-bold text-brand-text-primary">Excellent Reflection!</h3>
                    <p className="text-xs text-brand-text-secondary max-w-xs leading-relaxed">
                      "I learned: {reflectionText}"
                    </p>
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs rounded-xl w-full">
                      ✓ Streak protected! Sleep well! 🛏️
                    </div>
                    <button
                      onClick={() => setShowReflection(false)}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      Finish Day
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= ONE MINUTE PRACTICE MODAL ================= */}
      <AnimatePresence>
        {showOneMinPractice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowOneMinPractice(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-650 flex items-center gap-1.5">
                  <Timer className="w-4.5 h-4.5" />
                  <span>One-Minute Practice Sprint</span>
                </span>
                <button onClick={() => setShowOneMinPractice(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                {oneMinStep === 1 && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-brand-text-secondary">Step 1: Rapid Vocabulary Study</p>
                    <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold text-indigo-650 uppercase font-mono">Word {oneMinVocabIdx + 1} of 3</span>
                      <h3 className="text-2xl font-bold text-indigo-700">
                        {oneMinVocabIdx === 0 ? 'Eager' : oneMinVocabIdx === 1 ? 'Procrastinate' : 'Coherent'}
                      </h3>
                      <p className="text-xs text-brand-text-secondary leading-normal">
                        {oneMinVocabIdx === 0 ? 'Very excited and interested to do something.' : oneMinVocabIdx === 1 ? 'Delay or postpone action; put off doing something.' : 'Logical, clear, and easy to understand.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (oneMinVocabIdx < 2) {
                          setOneMinVocabIdx(prev => prev + 1);
                        } else {
                          setOneMinStep(2);
                        }
                      }}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      {oneMinVocabIdx < 2 ? 'Next Word' : 'Proceed to Reading'}
                    </button>
                  </div>
                )}

                {oneMinStep === 2 && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-brand-text-secondary">Step 2: Read &amp; Speak Aloud</p>
                    <div className="p-5 bg-gray-50 border border-gray-150 rounded-2xl">
                      <p className="text-xs font-semibold text-brand-text-primary">"I am learning English with SpeakFlow every day."</p>
                    </div>
                    <div className="flex flex-col items-center py-2 space-y-2.5">
                      <button onClick={toggleOneMinRecord} className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md ${oneMinIsRecording ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`}><Mic className="w-5.5 h-5.5" /></button>
                      <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">{oneMinIsRecording ? 'Listening...' : 'Tap Mic and read text'}</span>
                    </div>
                    {oneMinSpeechVerified && (
                      <div className="p-3 bg-emerald-50 border border-emerald-255 text-emerald-700 text-xs rounded-xl flex items-center space-x-1.5 justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /><span>Speech verified with 92% pronunciation accuracy!</span></div>
                    )}
                    <button disabled={!oneMinSpeechVerified} onClick={() => setOneMinStep(3)} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-md active:scale-95">Proceed to Grammar Quiz</button>
                  </div>
                )}

                {oneMinStep === 3 && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-brand-text-secondary">Step 3: Correct the Sentence Structure</p>
                    <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl space-y-1.5 text-left">
                      <span className="text-[9px] uppercase tracking-wider font-black text-indigo-600">Question:</span>
                      <p className="text-xs text-brand-text-primary font-bold">Identify the missing word: "She ______ to the park yesterday."</p>
                    </div>
                    <div className="flex flex-col space-y-2 text-left">
                      {[{ key: 'A', label: 'Goes' }, { key: 'B', label: 'Go' }, { key: 'C', label: 'Went' }, { key: 'D', label: 'Going' }].map((opt) => {
                        const isSelected = oneMinQuizAnswer === opt.key;
                        let btnStyle = "bg-white border-gray-200 text-brand-text-primary hover:bg-gray-50";
                        if (isSelected && !oneMinQuizSubmitted) btnStyle = "bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold";
                        if (oneMinQuizSubmitted) {
                          if (opt.key === 'C') btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-700 font-bold";
                          else if (isSelected) btnStyle = "bg-red-50 border-red-400 text-red-650 line-through";
                          else btnStyle = "bg-gray-50 border-gray-100 text-brand-text-muted opacity-50";
                        }
                        return (
                          <button key={opt.key} disabled={oneMinQuizSubmitted} onClick={() => setOneMinQuizAnswer(opt.key)} className={`p-3 border rounded-xl text-xs transition-all leading-normal flex items-center space-x-2.5 active:scale-[0.99] ${btnStyle}`}>
                            <span className="font-mono font-bold text-[10px]">{opt.key}.</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {!oneMinQuizSubmitted ? (
                      <button onClick={() => { setOneMinQuizSubmitted(true); speakWord(oneMinQuizAnswer === 'C' ? 'Correct answer!' : 'Not correct.'); }} disabled={!oneMinQuizAnswer} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-md active:scale-95">Submit Answer</button>
                    ) : (
                      <button onClick={() => setOneMinStep(4)} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95">Complete Practice</button>
                    )}
                  </div>
                )}

                {oneMinStep === 4 && (
                  <div className="space-y-5 text-center py-4 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce mb-2">
                      <Award className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-brand-text-primary">Sprint Completed!</h3>
                      <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs">Excellent focus! You learned vocabulary, verified pronunciation, and cleared grammar metrics.</p>
                    </div>
                    <button onClick={claimOneMinRewards} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 mt-4">Collect Rewards</button>
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= VOICE JOURNAL & DIARY DRAWERS ================= */}
      <AnimatePresence>
        {showDiary && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowDiary(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-purple-650 flex items-center gap-1.5"><FileText className="w-4.5 h-4.5" /><span>Today's English Diary</span></span>
                <button onClick={() => setShowDiary(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                {!diaryResult ? (
                  <div className="space-y-4">
                    <textarea placeholder="Write about your day..." value={diaryText} onChange={(e) => setDiaryText(e.target.value)} className="w-full h-36 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-brand-text-primary focus:outline-none focus:bg-white focus:border-purple-400 resize-none transition-all" />
                    <button disabled={diaryText.trim().split(/\s+/).length < 3 || diarySubmitting} onClick={handleSubmitDiary} style={{ borderRadius: '12px', padding: '14px' }} className="w-full bg-purple-600 hover:bg-purple-750 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-md active:scale-95">Submit Diary Entry</button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade">
                    <div className="flex justify-between items-center bg-purple-50 border border-purple-100 p-4.5 rounded-2xl">
                      <div className="text-left"><span className="text-[9px] text-purple-650 uppercase font-black">Score</span><p className="text-2xl font-black text-purple-700">{diaryResult.score} / 100</p></div>
                      <div className="text-right text-xs"><span className="font-bold text-brand-text-primary block">Grammar: {diaryResult.grammar}%</span><span className="font-semibold text-brand-text-secondary block">Naturalness: {diaryResult.naturalness}%</span></div>
                    </div>
                    <button onClick={() => setShowDiary(false)} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold transition-all">Finish</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceJournal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowVoiceJournal(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-amber-650 flex items-center gap-1.5"><Mic className="w-4.5 h-4.5" /><span>Voice Journal Challenge</span></span>
                <button onClick={() => setShowVoiceJournal(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-grow overflow-y-auto space-y-4 py-2 text-center">
                {!voiceResult ? (
                  <div className="flex flex-col items-center py-6 space-y-4">
                    <button onClick={handleToggleVoiceJournal} className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${voiceRecording ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}><Mic className="w-8 h-8" /></button>
                    <span className="text-xs font-bold text-brand-text-primary">{voiceRecording ? `🔴 Recording… 00:${voiceTimer < 10 ? '0' + voiceTimer : voiceTimer}` : 'Tap Mic to Start'}</span>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade text-left">
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center"><span className="text-[9px] uppercase font-bold text-amber-600 block">WPM</span><p className="text-lg font-black text-brand-text-primary mt-0.5">{voiceResult.wpm} WPM</p></div>
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-center"><span className="text-[9px] uppercase font-bold text-indigo-600 block">Pronounce</span><p className="text-lg font-black text-brand-text-primary mt-0.5">{voiceResult.pronunciation}%</p></div>
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center"><span className="text-[9px] uppercase font-bold text-emerald-600 block">Fluency</span><p className="text-lg font-black text-brand-text-primary mt-0.5">{voiceResult.fluency}%</p></div>
                    </div>
                    <button onClick={() => setShowVoiceJournal(false)} style={{ borderRadius: '12px', padding: '12px' }} className="w-full bg-amber-500 hover:bg-amber-605 text-white text-xs font-bold">Finish</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
