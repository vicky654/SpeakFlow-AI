import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Vocabulary } from './pages/Vocabulary';
import { VocabGame } from './pages/VocabGame';
import { SpeakingPractice } from './pages/SpeakingPractice';
import { ListeningPractice } from './pages/ListeningPractice';
import { ReadingPractice } from './pages/ReadingPractice';
import { WritingPractice } from './pages/WritingPractice';
import { GrammarCourse } from './pages/GrammarCourse';
import { InterviewPrep } from './pages/InterviewPrep';
import { Profile } from './pages/Profile';
import { AdminPanel } from './pages/AdminPanel';
import { LearnHub } from './pages/LearnHub';
import { PracticeHub } from './pages/PracticeHub';
import { ProgressHub } from './pages/ProgressHub';
import { ChallengeTimeline } from './pages/ChallengeTimeline';
import { ChallengeDayDrill } from './pages/ChallengeDayDrill';
import { LuckySpin } from './pages/LuckySpin';
import { AiTeacher } from './pages/AiTeacher';
import { Sparkles, CheckCircle2, ArrowRight, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { IonApp, IonPage, IonContent } from '@ionic/react';

// IMINENT ONBOARDING SCREEN WIZARD
const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Speak Fluently');
  const [level, setLevel] = useState('Beginner');
  const [time, setTime] = useState('15 min');
  
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [planGenerated, setPlanGenerated] = useState(false);

  useEffect(() => {
    if (step === 5 && !planGenerated) {
      const interval = setInterval(() => {
        setGeneratingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPlanGenerated(true);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step, planGenerated]);

  const handleFinish = () => {
    localStorage.setItem('speakflow_onboarding', 'true');
    localStorage.setItem('speakflow_goal', goal);
    localStorage.setItem('speakflow_level', level);
    localStorage.setItem('speakflow_time', time);
    onComplete();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg px-4 select-none text-brand-text-primary">
      <div className="w-full max-w-sm card space-y-6 text-left border border-gray-150 p-6 shadow-xl relative overflow-hidden bg-white">
        
        {/* Step dots */}
        {step < 5 && (
          <div className="flex space-x-1.5 justify-center">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-5 bg-indigo-600' : 'w-1.5 bg-gray-200'}`} 
              />
            ))}
          </div>
        )}

        {/* SCREEN 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-650 animate-bounce">
              <Bot className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-brand-text-primary">Welcome 👋</h2>
              <p className="text-sm font-semibold text-brand-text-secondary max-w-xs mx-auto leading-relaxed">
                "I'll help you speak English confidently."
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 2: GOALS */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-brand-text-primary">What's your goal?</h3>
              <p className="text-[10px] text-brand-text-secondary">We will customize vocabulary and drills based on this.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              {['Speak Fluently', 'Interview', 'Office', 'Travel', 'Daily Conversation'].map(opt => {
                const isSelected = goal === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setGoal(opt)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all active:scale-[0.985] ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold' 
                        : 'bg-gray-50 border-gray-150 text-brand-text-secondary hover:border-indigo-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1 mt-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 3: LEVEL */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-brand-text-primary">Current Level</h3>
              <p className="text-[10px] text-brand-text-secondary">Select your current communication proficiency.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              {['Beginner', 'Basic', 'Intermediate'].map(opt => {
                const isSelected = level === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setLevel(opt)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all active:scale-[0.985] ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold' 
                        : 'bg-gray-50 border-gray-150 text-brand-text-secondary hover:border-indigo-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(4)}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1 mt-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 4: STUDY TIME */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-brand-text-primary">How much time?</h3>
              <p className="text-[10px] text-brand-text-secondary">Select daily study duration target.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 text-center">
              {['5 min', '10 min', '15 min', '20 min'].map(opt => {
                const isSelected = time === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setTime(opt)}
                    className={`p-4 rounded-xl border text-xs font-bold transition-all active:scale-[0.985] flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-gray-50 border-gray-150 text-brand-text-secondary hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-base">⏱️</span>
                    <span className="mt-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(5)}
              style={{ borderRadius: '12px', padding: '12px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1 mt-2"
            >
              <span>Generate Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SCREEN 5: GENERATE PLAN ROADMAP */}
        {step === 5 && (
          <div className="space-y-5 py-2">
            {!planGenerated ? (
              <div className="space-y-4 text-center py-4 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-brand-text-primary">AI is generating your personalized roadmap...</h3>
                  <p className="text-[10px] text-brand-text-secondary">Tailoring vocabulary topics and roleplay drills...</p>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${generatingProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-650 flex items-center justify-center animate-bounce mb-1">
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-black text-brand-text-primary">Learning Plan Generated!</h3>
                  <p className="text-xs text-brand-text-secondary leading-relaxed max-w-xs mx-auto">
                    Your {time} daily custom curriculum is set! Focus area: **{goal}** at **{level}** standard.
                  </p>
                </div>

                {/* Checklist recap */}
                <div className="w-full bg-gray-50 border border-gray-150 p-4 rounded-xl text-left text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-brand-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Greetings &amp; Introductions (Week 1)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-brand-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Restaurant &amp; Travel scenarios (Week 2)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-brand-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Office Meeting dialogues (Week 3)</span>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  style={{ borderRadius: '12px', padding: '12px' }}
                  className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Start Learning →</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const loadUser = useAuthStore(state => state.loadUser);
  const darkMode = useAuthStore(state => state.darkMode);
  const navigate = useNavigate();

  // Onboarding completion check state
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    localStorage.getItem('speakflow_onboarding') === 'true'
  );

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (!user) {
      loadUser();
    }
  }, [token, user, loadUser, navigate]);

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    }
  }, [darkMode]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg flex-col space-y-3 text-brand-text-primary">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-brand-text-secondary">Restoring learning session...</p>
      </div>
    );
  }

  // Intercept and show full-screen onboarding wizard if not completed
  if (!onboardingCompleted) {
    return <Onboarding onComplete={() => setOnboardingCompleted(true)} />;
  }

  return (
    <IonPage className="bg-brand-bg text-brand-text-primary">
      <div className="flex h-screen w-screen overflow-hidden bg-brand-bg">
        
        {/* 1. DESKTOP SIDEBAR NAVIGATION */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* 2. MAIN APP CONTENT PANEL */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-brand-bg">
          
          {/* DESKTOP TOP BAR OR MOBILE TOP BAR */}
          <div className="hidden md:block">
            <Navbar onToggleMobileSidebar={() => {}} />
          </div>
          <div className="block md:hidden">
            <MobileHeader />
          </div>
          
          {/* INNER CONTENT SCROLL CONTAINER */}
          <IonContent className="flex-1 overflow-y-auto bg-brand-bg" scrollEvents={true}>
            <div className="px-4 md:px-8 pt-20 pb-36 md:py-6 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/learn" element={<LearnHub />} />
                <Route path="/speak" element={<PracticeHub />} />
                <Route path="/progress" element={<ProgressHub />} />
                <Route path="/ai-teacher" element={<AiTeacher />} />
                
                <Route path="/vocab" element={<Vocabulary />} />
                <Route path="/game" element={<VocabGame />} />
                <Route path="/speaking" element={<SpeakingPractice />} />
                <Route path="/listening" element={<ListeningPractice />} />
                <Route path="/reading" element={<ReadingPractice />} />
                <Route path="/writing" element={<WritingPractice />} />
                <Route path="/grammar" element={<GrammarCourse />} />
                <Route path="/interview" element={<InterviewPrep />} />
                <Route path="/profile" element={<Profile />} />
                
                <Route path="/challenge" element={<ChallengeTimeline />} />
                <Route path="/challenge/day/:dayNumber" element={<ChallengeDayDrill />} />
                <Route path="/lucky-spin" element={<LuckySpin />} />
                
                {/* Guarded Admin panel route */}
                <Route 
                  path="/admin" 
                  element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
                />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </IonContent>

          {/* 3. MOBILE STICKY BOTTOM NAVIGATION BAR - renders OUTSIDE scroll area */}
          <div className="block md:hidden">
            <BottomNavigation />
          </div>

        </div>

      </div>
    </IonPage>
  );
};

export const App: React.FC = () => {
  useEffect(() => {
    const handleFocusIn = (e: any) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };
    window.addEventListener('focusin', handleFocusIn);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return (
    <IonApp>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<ProtectedLayout />} />
      </Routes>
    </IonApp>
  );
};
