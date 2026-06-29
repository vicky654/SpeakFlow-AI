import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
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
import { Menu, X } from 'lucide-react';

// PROTECTED ROUTES ROUTER CONTAINER
const ProtectedLayout: React.FC = () => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const loadUser = useAuthStore(state => state.loadUser);
  const darkMode = useAuthStore(state => state.darkMode);
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (!user) {
      loadUser();
    }
  }, [token, user, loadUser, navigate]);

  // Synchronize darkMode theme classes on body element
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

  // Close mobile sidebar drawer on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 flex-col space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Restoring learning session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="w-64 h-full relative animate-slide-in">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* 3. MAIN DISPLAY WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vocab" element={<Vocabulary />} />
            <Route path="/game" element={<VocabGame />} />
            <Route path="/speaking" element={<SpeakingPractice />} />
            <Route path="/listening" element={<ListeningPractice />} />
            <Route path="/reading" element={<ReadingPractice />} />
            <Route path="/writing" element={<WritingPractice />} />
            <Route path="/grammar" element={<GrammarCourse />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Guarded Admin panel route */}
            <Route 
              path="/admin" 
              element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<ProtectedLayout />} />
    </Routes>
  );
};
