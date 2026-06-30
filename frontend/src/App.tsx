import React, { useEffect } from 'react';
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

import { IonApp, IonPage, IonContent } from '@ionic/react';

const ProtectedLayout: React.FC = () => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const loadUser = useAuthStore(state => state.loadUser);
  const darkMode = useAuthStore(state => state.darkMode);
  const navigate = useNavigate();

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
          {/* pb-36 on mobile = 144px clearance above the 76px floating bottom nav */}
          <IonContent className="flex-1 overflow-y-auto bg-brand-bg" scrollEvents={true}>
            <div className="px-4 md:px-8 pt-20 pb-36 md:py-6 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/learn" element={<LearnHub />} />
                <Route path="/practice" element={<PracticeHub />} />
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
