import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { 
  Mic, Headset, Briefcase, ArrowRight, MessageSquare, Gamepad2, 
  HelpCircle, Bot, User, Send, X, Volume2, Sparkles, RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';

interface ScrambledQuestion {
  id: number;
  scrambled: string[];
  correct: string;
  explanation: string;
}

const SCRAMBLED_QUESTIONS: ScrambledQuestion[] = [
  { id: 1, scrambled: ["school", "everyday", "I", "go"], correct: "I go to school everyday", explanation: "Add the preposition 'to' when indicating destination after 'go'." },
  { id: 2, scrambled: ["likes", "music", "she", "pop"], correct: "she likes pop music", explanation: "Subject-Verb-Object word order in English statements." },
  { id: 3, scrambled: ["yesterday", "went", "we", "park"], correct: "we went to the park yesterday", explanation: "Indicator of time 'yesterday' usually goes at the end of the sentence." },
  { id: 4, scrambled: ["English", "well", "speaks", "he"], correct: "he speaks English well", explanation: "Adverbs of manner ('well') follow the direct object ('English')." }
];

export const PracticeHub: React.FC = () => {
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const token = useAuthStore(state => state.token);
  const loadUser = useAuthStore(state => state.loadUser);
  const navigate = useNavigate();

  // Modals
  const [showRolePlay, setShowRolePlay] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleMessages, setRoleMessages] = useState<any[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [rolePlayingText, setRolePlayingText] = useState<number | null>(null);

  const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
  const [currentBuilderIdx, setCurrentBuilderIdx] = useState(0);
  const [builderSelections, setBuilderSelections] = useState<string[]>([]);
  const [builderSubmitted, setBuilderSubmitted] = useState(false);
  const [builderCorrect, setBuilderCorrect] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  useEffect(() => {
    if (showRolePlay) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [roleMessages, showRolePlay]);

  const practices = [
    {
      title: 'Speaking Practice',
      desc: 'Talk aloud in real-world scenarios. Our AI parses and evaluates your pitch.',
      progress: dailyChallenge?.checklist?.speaking?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.speaking?.completed ? 'Completed' : 'Pending Speak',
      icon: Mic,
      color: 'from-orange-500 to-amber-600',
      strokeColor: 'stroke-orange-500',
      to: '/speaking'
    },
    {
      title: 'Listening Dialogue',
      desc: 'Listen to mock customer services, podcasts, and check native speed conversations.',
      progress: dailyChallenge?.checklist?.listening?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.listening?.completed ? 'Completed' : 'Pending Listen',
      icon: Headset,
      color: 'from-emerald-500 to-teal-600',
      strokeColor: 'stroke-emerald-500',
      to: '/listening'
    }
  ];

  const rolePlayOptions = [
    { id: 'hr', title: 'HR Interview Panel', desc: 'Mock HR screening board questions.', welcome: "Hello, thank you for coming in today. Let's start. Why do you want to join our company?" },
    { id: 'restaurant', title: 'Restaurant Dining', desc: 'Order foods and clear bills at a diner.', welcome: "Welcome to Prime Bistro! Can I start you off with a table for two, or would you like to order takeout?" },
    { id: 'hotel', title: 'Hotel Registration Desk', desc: 'Manage room bookings and luggage reviews.', welcome: "Good afternoon, check-in registration desk. Do you have a reservation under your name?" },
    { id: 'doctor', title: 'Doctor Clinic Visit', desc: 'Explain symptoms and review prescriptions.', welcome: "Hello there, come in and sit down. What seems to be the problem today?" }
  ];

  // LAUNCH ROLE PLAY
  const startRolePlay = (role: any) => {
    setSelectedRole(role.title);
    setRoleMessages([
      { role: 'assistant', content: role.welcome }
    ]);
    setRoleInput('');
    setShowRolePlay(true);
  };

  const handleSendRoleMessage = async () => {
    if (!roleInput.trim() || roleLoading) return;
    const userMsg = { role: 'user', content: roleInput };
    setRoleMessages(prev => [...prev, userMsg]);
    setRoleInput('');
    setRoleLoading(true);

    try {
      const contextPrompt = `You are a helpful simulation partner for a professional Role Play about "${selectedRole}".
If the user makes spelling or grammar mistakes, reply naturally first, then add a section formatted like:
"🔧 Corrections: [explain user mistakes here]" at the bottom. Keep your reply simple for a beginner.`;

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
            ...roleMessages.map(m => ({ role: m.role, content: m.content })),
            userMsg
          ]
        })
      });

      if (!res.ok) throw new Error('Offline');
      const data = await res.json();

      setRoleMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply
      }]);
    } catch (e) {
      setRoleMessages(prev => [...prev, {
        role: 'assistant',
        content: "I am having trouble connecting. Let's try again in a second! 🌐"
      }]);
    } finally {
      setRoleLoading(false);
    }
  };

  const speakText = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (rolePlayingText === index) {
        window.speechSynthesis.cancel();
        setRolePlayingText(null);
      } else {
        window.speechSynthesis.cancel();
        const clean = text.replace(/🔧\s*Corrections:[\s\S]*$/i, '').replace(/\*\*|\*|👉|❌|✅|💡/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => setRolePlayingText(null);
        utterance.onerror = () => setRolePlayingText(null);
        setRolePlayingText(index);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // SENTENCE BUILDER HELPERS
  const startSentenceBuilder = () => {
    setCurrentBuilderIdx(0);
    setBuilderSelections([]);
    setBuilderSubmitted(false);
    setBuilderCorrect(false);
    setShowSentenceBuilder(true);
  };

  const handleWordSelect = (word: string) => {
    if (builderSubmitted) return;
    if (builderSelections.includes(word)) {
      setBuilderSelections(prev => prev.filter(w => w !== word));
    } else {
      setBuilderSelections(prev => [...prev, word]);
    }
  };

  const verifyBuilderSentence = async () => {
    const q = SCRAMBLED_QUESTIONS[currentBuilderIdx];
    const cleanUser = builderSelections.join(' ').toLowerCase().trim();
    const cleanCorrect = q.correct.toLowerCase().trim();
    const isCorrect = cleanUser === cleanCorrect;

    setBuilderCorrect(isCorrect);
    setBuilderSubmitted(true);

    if (isCorrect) {
      speakWord("Correct sentence structure!");
      // Award XP
      try {
        await fetch(`${API_BASE_URL}/gamification/credit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ xp: 10, coins: 2 })
        });
        if (loadUser) await loadUser();
      } catch (e) {
        console.error(e);
      }
    } else {
      speakWord("Not correct. Read explanation below.");
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-6 pb-24 select-none max-w-lg mx-auto text-left px-1 text-brand-text-primary">
      
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">Practice Playground</h2>
        <p className="text-xs text-brand-text-secondary">Drill pronunciation, mock interviews, and build grammar sentences.</p>
      </div>

      {/* CORE PRACTICES SCENARIOS */}
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Speech &amp; Listening Drills</span>
        <div className="space-y-3">
          {practices.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(mod.to)}
                className="card hover:border-indigo-500/30 transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${mod.color} text-white shrink-0 shadow-md`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-brand-text-primary truncate">{mod.title}</h4>
                    <p className="text-[10px] text-brand-text-secondary line-clamp-1 leading-normal mt-0.5">{mod.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <ProgressRing radius={15} stroke={2.5} progress={mod.progress} color={mod.strokeColor} />
                  <ArrowRight className="w-4 h-4 text-brand-text-secondary" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI ROLE PLAY CONVERSATION CARDS */}
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">AI Role Play Scenarios</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rolePlayOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => startRolePlay(opt)}
              className="card flex flex-col justify-between hover:border-indigo-400 cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-sm text-brand-text-primary leading-tight">{opt.title}</h4>
                <p className="text-[10px] text-brand-text-secondary leading-normal">{opt.desc}</p>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold mt-4 flex items-center gap-1">
                <span>Start Session</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GRAMMAR SENTENCE BUILDER GAME BUTTON */}
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Grammar Sandbox</span>
        
        <div 
          onClick={startSentenceBuilder}
          className="card flex items-center justify-between hover:border-indigo-400 cursor-pointer transition-all active:scale-[0.99] bg-gradient-to-br from-white to-indigo-50/10 border-indigo-50"
        >
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
              <Gamepad2 className="w-5.5 h-5.5" />
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-brand-text-primary">AI Sentence Builder</h4>
              <p className="text-[10px] text-brand-text-secondary truncate">Rearrange scrambled blocks into correct English sentences.</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-brand-text-secondary" />
        </div>
      </div>

      {/* ================= AI ROLE PLAY MODAL SHEET ================= */}
      <AnimatePresence>
        {showRolePlay && selectedRole && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowRolePlay(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left">
              
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-600 flex items-center gap-1.5 font-sans">
                  <Bot className="w-4.5 h-4.5" />
                  <span>{selectedRole} Role Play</span>
                </span>
                <button onClick={() => setShowRolePlay(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>

              {/* Message History */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-none bg-gray-50/50 rounded-2xl my-3 border border-gray-100">
                {roleMessages.map((msg, i) => {
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
                            : 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {isAI && (
                            <button
                              onClick={() => speakText(msg.content, i)}
                              className={`absolute -right-3 top-2.5 p-1 rounded-full border shadow-sm transition-all active:scale-90 ${
                                rolePlayingText === i 
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-650 animate-pulse'
                                  : 'bg-white border-gray-205 text-gray-500 hover:text-indigo-600'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {!isAI && (
                        <div className="w-7 h-7 rounded-lg bg-gray-150 border border-gray-200 text-gray-500 flex items-center justify-center shrink-0 mt-0.5 font-bold uppercase text-[10px]">
                          U
                        </div>
                      )}
                    </div>
                  );
                })}

                {roleLoading && (
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
                <div ref={chatEndRef} />
              </div>

              {/* Chat Send input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendRoleMessage();
                }}
                className="flex items-center gap-2 pt-2 pb-6 shrink-0 bg-white"
              >
                <input
                  type="text"
                  placeholder="Type your response to the role actor..."
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="flex-grow py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-brand-text-primary focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-sans"
                />
                
                <button
                  type="submit"
                  disabled={!roleInput.trim() || roleLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl active:scale-95 disabled:opacity-20 shadow-md transition-all shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= AI SENTENCE BUILDER MODAL SHEET ================= */}
      <AnimatePresence>
        {showSentenceBuilder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowSentenceBuilder(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-600 flex items-center gap-1.5">
                  <Gamepad2 className="w-4.5 h-4.5" />
                  <span>AI Sentence Builder</span>
                </span>
                <button onClick={() => setShowSentenceBuilder(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase font-mono">Question {currentBuilderIdx + 1} of {SCRAMBLED_QUESTIONS.length}</span>
                  <p className="text-xs text-brand-text-secondary">Tap the scrambled words in order to form a correct English sentence.</p>
                </div>

                {/* Display selections box */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl min-h-[56px] flex flex-wrap gap-2 items-center">
                  {builderSelections.length > 0 ? (
                    builderSelections.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleWordSelect(w)}
                        className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs cursor-pointer select-none active:scale-95 transition-all"
                      >
                        {w}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-brand-text-muted italic">Click options below to build sentence...</span>
                  )}
                </div>

                {/* Scrambled selection pool */}
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-text-muted">Options pool:</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SCRAMBLED_QUESTIONS[currentBuilderIdx].scrambled.map((word) => {
                      const isSelected = builderSelections.includes(word);
                      return (
                        <button
                          key={word}
                          disabled={builderSubmitted}
                          onClick={() => handleWordSelect(word)}
                          className={`px-4 py-2.5 border rounded-xl text-xs font-semibold transition-all ${
                            isSelected 
                              ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-40 cursor-default'
                              : 'bg-white border-gray-200 text-brand-text-primary hover:border-indigo-300'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear / submit controls */}
                {!builderSubmitted ? (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setBuilderSelections([])}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="flex-1 bg-white border border-gray-250 text-brand-text-secondary text-xs font-bold active:scale-95 transition-all"
                    >
                      Clear Selections
                    </button>
                    <button
                      disabled={builderSelections.length < SCRAMBLED_QUESTIONS[currentBuilderIdx].scrambled.length}
                      onClick={verifyBuilderSentence}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-705 disabled:opacity-30 text-white text-xs font-bold active:scale-95 transition-all shadow-md flex items-center justify-center space-x-1"
                    >
                      <span>Check Structure</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 animate-fade">
                    {/* Result notification */}
                    <div className={`p-4 border rounded-2xl text-center space-y-2 ${
                      builderCorrect 
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                        : 'bg-red-50 border-red-250 text-red-600'
                    }`}>
                      <h4 className="text-xs font-bold flex items-center justify-center gap-1.5">
                        {builderCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Correct! +10 XP</span>
                          </>
                        ) : (
                          <>
                            <span>Incorrect Phrasing</span>
                          </>
                        )}
                      </h4>
                      <p className="text-[10px] text-brand-text-secondary leading-relaxed">
                        {SCRAMBLED_QUESTIONS[currentBuilderIdx].explanation}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (currentBuilderIdx < SCRAMBLED_QUESTIONS.length - 1) {
                          setCurrentBuilderIdx(prev => prev + 1);
                          setBuilderSelections([]);
                          setBuilderSubmitted(false);
                          setBuilderCorrect(false);
                        } else {
                          setShowSentenceBuilder(false);
                        }
                      }}
                      style={{ borderRadius: '12px', padding: '12px' }}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span>{currentBuilderIdx < SCRAMBLED_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Game'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
