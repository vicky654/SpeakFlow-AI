import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { 
  Mic, Headset, Briefcase, ArrowRight, MessageSquare, Gamepad2, 
  HelpCircle, Bot, User, Send, X, Volume2, Sparkles, RefreshCw, CheckCircle2, 
  ChevronRight, Lock, Laptop, Plane, CreditCard 
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
  { id: 3, scrambled: ["yesterday", "went", "we", "park"], correct: "we went to the park yesterday", explanation: "Indicator of time 'yesterday' usually goes at the end of the sentence." }
];

export const PracticeHub: React.FC = () => {
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const loadUser = useAuthStore(state => state.loadUser);
  const navigate = useNavigate();

  // Tab filtering: general, interview, business, travel
  const [activeTab, setActiveTab] = useState<'general' | 'interview' | 'business' | 'travel'>('general');

  // Modals & Paywall
  const [showPaywall, setShowPaywall] = useState(false);
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

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // CATEGORIZED PATHWAYS CONTENT LIST
  const generalPractices = [
    {
      title: 'Speaking Practice Coach',
      desc: 'Talk aloud in real-world scenarios. Get dynamic pronunciation pitch ratings.',
      progress: dailyChallenge?.checklist?.speaking?.completed ? 100 : 0,
      icon: Mic,
      color: 'from-orange-500 to-amber-600',
      to: '/speaking'
    },
    {
      title: 'Listening Dialogue drills',
      desc: 'Listen to native-speed conversations and solve dialog questions.',
      progress: dailyChallenge?.checklist?.listening?.completed ? 100 : 0,
      icon: Headset,
      color: 'from-emerald-500 to-teal-600',
      to: '/listening'
    }
  ];

  const interviewScenarios = [
    { id: 'hr', title: 'HR Screening panel', desc: 'Introduce yourself and state salary expectations.', welcome: "Welcome, let's start. Why do you want to join our company as an engineer?" },
    { id: 'strengths', title: 'Strengths & Weaknesses debate', desc: 'Structure arguments for weaknesses questions.', welcome: "Excellent. Can you outline a major weakness of yours and what you did to overcome it?" },
    { id: 'negotiation', title: 'Salary Negotiation consult', desc: 'Mock HR screening negotiation phrases.', welcome: "Thank you. Let's discuss pay. What is your expected salary range for this role?" }
  ];

  const businessScenarios = [
    { id: 'meeting', title: 'Lead Office Meetings', desc: 'Practice status checks and presentation openers.', welcome: "Hi team, let's start our status alignment. Who would like to present their progress report first?" },
    { id: 'client_call', title: 'Client Consultation', desc: 'Review project deadlines and contract specs.', welcome: "Good day. We are reviewing the deliverables for our sprint. Do you see any delay risks?" }
  ];

  const travelScenarios = [
    { id: 'immigration', title: 'Immigration checkpoint', desc: 'Answer airport visa and luggage checks.', welcome: "Passport and visa document check, please. What is the purpose of your visit today?" },
    { id: 'hotel', title: 'Hotel Reception Desk', desc: 'Register rooms and request extra keys.', welcome: "Welcome, reservation checking desk. Do you have a hotel booking registration under your name?" }
  ];

  // Tab path click verification
  const handlePathClick = (scenario: any, category: string) => {
    if (category !== 'general' && user?.role !== 'admin') {
      setShowPaywall(true);
      return;
    }
    
    // Launch role play chat
    setSelectedRole(scenario.title);
    setRoleMessages([
      { role: 'assistant', content: scenario.welcome }
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
      const contextPrompt = `You are a helpful partner for a professional Role Play about "${selectedRole}".
Give natural, brief dialogue responses suitable for a beginner. If the user makes grammar mistakes, write feedback tips at the bottom: "🔧 Corrections: [details]"`;

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
      setRoleMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setRoleMessages(prev => [...prev, { role: 'assistant', content: "Connect error, let's retry. 🌐" }]);
    } finally {
      setRoleLoading(false);
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
      try {
        await fetch(`${API_BASE_URL}/gamification/credit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ xp: 10, coins: 2 })
        });
        if (loadUser) await loadUser();
      } catch (e) {
        console.error(e);
      }
    } else {
      speakWord("Not correct.");
    }
  };

  const handleUpgradeAccount = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: 'admin' })
      });
      if (loadUser) await loadUser();
    } catch (e) {
      console.error(e);
    }
    setShowPaywall(false);
  };

  return (
    <div className="space-y-6 pb-24 select-none max-w-lg mx-auto text-left px-1 text-brand-text-primary">
      
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">Practice Playground</h2>
        <p className="text-xs text-brand-text-secondary">Drill situational pathways and build grammar sentences.</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex bg-gray-50 border border-gray-150 p-1 rounded-xl text-[10px] font-black uppercase text-brand-text-secondary">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 rounded-lg text-center transition-all ${
            activeTab === 'general' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-brand-text-primary'
          }`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('interview')}
          className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-brand-text-primary'
          }`}
        >
          <span>Interview</span>
          {user?.role !== 'admin' && <Lock className="w-3 h-3 text-amber-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('business')}
          className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'business' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-brand-text-primary'
          }`}
        >
          <span>Business</span>
          {user?.role !== 'admin' && <Lock className="w-3 h-3 text-amber-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('travel')}
          className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'travel' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-brand-text-primary'
          }`}
        >
          <span>Travel</span>
          {user?.role !== 'admin' && <Lock className="w-3 h-3 text-amber-500" />}
        </button>
      </div>

      {/* RENDER ACTIVE TAB SCENARIOS */}
      <div className="space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-3">
            {generalPractices.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(mod.to)}
                  className="card hover:border-indigo-500/30 transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${mod.color} text-white shrink-0 shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-brand-text-primary truncate">{mod.title}</h4>
                      <p className="text-[10px] text-brand-text-secondary line-clamp-1 mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-text-secondary shrink-0" />
                </div>
              );
            })}

            {/* Sentence Builder */}
            <div 
              onClick={startSentenceBuilder}
              className="card flex items-center justify-between hover:border-indigo-400 cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                  <Gamepad2 className="w-5.5 h-5.5" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-brand-text-primary">Sentence Builder Game</h4>
                  <p className="text-[10px] text-brand-text-secondary truncate">Rearrange scrambled word blocks.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-text-secondary shrink-0" />
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interviewScenarios.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handlePathClick(opt, 'interview')}
                className="card flex flex-col justify-between hover:border-indigo-400 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden"
              >
                {user?.role !== 'admin' && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-550 flex items-center gap-1 text-[8px] font-black uppercase">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Premium</span>
                  </div>
                )}
                <div className="space-y-2.5 pt-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text-primary leading-tight">{opt.title}</h4>
                  <p className="text-[10px] text-brand-text-secondary leading-normal">{opt.desc}</p>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-4">Start Session →</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'business' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessScenarios.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handlePathClick(opt, 'business')}
                className="card flex flex-col justify-between hover:border-indigo-400 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden"
              >
                {user?.role !== 'admin' && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500/10 text-amber-550 flex items-center gap-1 text-[8px] font-black uppercase">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Premium</span>
                  </div>
                )}
                <div className="space-y-2.5 pt-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-655 flex items-center justify-center">
                    <Laptop className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text-primary leading-tight">{opt.title}</h4>
                  <p className="text-[10px] text-brand-text-secondary leading-normal">{opt.desc}</p>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-4">Start Session →</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'travel' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {travelScenarios.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handlePathClick(opt, 'travel')}
                className="card flex flex-col justify-between hover:border-indigo-400 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden"
              >
                {user?.role !== 'admin' && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500/10 text-amber-550 flex items-center gap-1 text-[8px] font-black uppercase">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Premium</span>
                  </div>
                )}
                <div className="space-y-2.5 pt-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center">
                    <Plane className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-sm text-brand-text-primary leading-tight">{opt.title}</h4>
                  <p className="text-[10px] text-brand-text-secondary leading-normal">{opt.desc}</p>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold mt-4">Start Session →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= PREMIUM MONETIZATION PAYWALL OVERLAY ================= */}
      <AnimatePresence>
        {showPaywall && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowPaywall(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white border border-gray-250 rounded-[28px] p-6 z-50 pointer-events-auto shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-bounce mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-brand-text-primary">Unlock SpeakFlow Premium ⚡</h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
                  Access unlimited AI Voice Conversations, dynamic job interview preps, business meeting simulations, and advanced weekly performance stories.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-left space-y-2 text-xs">
                <p className="font-semibold text-brand-text-primary flex justify-between">
                  <span>Premium Yearly Membership</span>
                  <span className="text-indigo-600 font-bold">$9.99/month</span>
                </p>
                <ul className="text-[10px] text-brand-text-secondary space-y-1">
                  <li>• Unlimited WhatsApp Voice chats</li>
                  <li>• 4 Specialized Business &amp; Travel courses</li>
                  <li>• Dynamic CEFR level progress credentials</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPaywall(false)} style={{ borderRadius: '12px', padding: '10px' }} className="flex-1 bg-white border border-gray-255 text-brand-text-secondary text-xs font-bold active:scale-95">Cancel</button>
                <button onClick={handleUpgradeAccount} style={{ borderRadius: '12px', padding: '10px' }} className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold active:scale-95">Upgrade Now</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= AI ROLE PLAY MODAL SHEET ================= */}
      <AnimatePresence>
        {showRolePlay && selectedRole && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowRolePlay(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left">
              
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-600 flex items-center gap-1.5">
                  <Bot className="w-4.5 h-4.5" />
                  <span>{selectedRole} Role Play</span>
                </span>
                <button onClick={() => setShowRolePlay(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>

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
                          isAI ? 'bg-white border-gray-200 text-brand-text-primary shadow-sm' : 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>
                          {isAI && (
                            <button
                              onClick={() => speakText(msg.content, i)}
                              className={`absolute -right-3 top-2.5 p-1 rounded-full border shadow-sm ${
                                rolePlayingText === i ? 'bg-emerald-500/20 border-emerald-500 text-emerald-650 animate-pulse' : 'bg-white text-gray-500'
                              }`}
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {roleLoading && <div className="p-3 bg-white rounded-xl">AI Thinking...</div>}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendRoleMessage();
                }}
                className="flex items-center gap-2 pt-2 pb-6 shrink-0 bg-white"
              >
                <input
                  type="text"
                  placeholder="Type your response..."
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="flex-grow py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none"
                />
                <button type="submit" disabled={!roleInput.trim() || roleLoading} className="p-3 bg-indigo-600 text-white rounded-xl active:scale-95"><Send className="w-4 h-4" /></button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= AI SENTENCE BUILDER GAME ================= */}
      <AnimatePresence>
        {showSentenceBuilder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowSentenceBuilder(false)} className="fixed inset-0 bg-black z-50 pointer-events-auto" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-[28px] z-50 p-6 flex flex-col pointer-events-auto text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3 shrink-0">
                <span className="text-xs font-black uppercase text-indigo-600 flex items-center gap-1.5"><Gamepad2 className="w-4.5 h-4.5" /><span>Sentence Builder Game</span></span>
                <button onClick={() => setShowSentenceBuilder(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-grow overflow-y-auto space-y-4 py-2">
                <div className="p-4 bg-gray-50 border rounded-2xl min-h-[56px] flex flex-wrap gap-2 items-center">
                  {builderSelections.map((w, idx) => (
                    <span key={idx} onClick={() => handleWordSelect(w)} className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer">{w}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SCRAMBLED_QUESTIONS[currentBuilderIdx].scrambled.map((word) => {
                    const isSelected = builderSelections.includes(word);
                    return (
                      <button key={word} disabled={builderSubmitted} onClick={() => handleWordSelect(word)} className={`px-4 py-2.5 border rounded-xl text-xs font-semibold ${isSelected ? 'opacity-30' : 'bg-white'}`}>{word}</button>
                    );
                  })}
                </div>
                {!builderSubmitted ? (
                  <button disabled={builderSelections.length < SCRAMBLED_QUESTIONS[currentBuilderIdx].scrambled.length} onClick={verifyBuilderSentence} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold">Check Sentence</button>
                ) : (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs">{SCRAMBLED_QUESTIONS[currentBuilderIdx].explanation}</p>
                    <button onClick={() => { if (currentBuilderIdx < SCRAMBLED_QUESTIONS.length - 1) { setCurrentBuilderIdx(prev => prev + 1); setBuilderSelections([]); setBuilderSubmitted(false); } else { setShowSentenceBuilder(false); } }} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold">Next</button>
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
