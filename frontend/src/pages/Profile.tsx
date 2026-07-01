import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { 
  Flame, Coins, Sparkles, Award, Printer, ShieldAlert, 
  Sun, Moon, LogOut, Trophy, CheckCircle2, Search, Star, BookOpen, ChevronRight, X, Volume2, Users 
} from 'lucide-react';

export const Profile: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const darkMode = useAuthStore(state => state.darkMode);
  const toggleTheme = useAuthStore(state => state.toggleTheme);
  const logout = useAuthStore(state => state.logout);
  
  const { leaderboard, badges, fetchLeaderboard, fetchBadges } = useLearningStore();
  const navigate = useNavigate();

  // Settings states
  const [voicePreference, setVoicePreference] = useState(
    localStorage.getItem('speakflow_voice_preference') || 'Emma (US)'
  );
  const [communityRoomsEnabled, setCommunityRoomsEnabled] = useState(
    localStorage.getItem('speakflow_community_rooms') === 'true'
  );
  const [showParentPortal, setShowParentPortal] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
  }, [fetchLeaderboard, fetchBadges]);

  const totalLessonsCount = user?.completedLessons.length || 0;
  const isEligibleForCertificate = totalLessonsCount >= 3 || (user?.level && user.level >= 2);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleVoiceChange = (pref: string) => {
    setVoicePreference(pref);
    localStorage.setItem('speakflow_voice_preference', pref);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Hello! You selected my voice for learning English.`);
      u.lang = pref.includes('UK') ? 'en-GB' : pref.includes('India') ? 'en-IN' : 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const handleToggleCommunity = () => {
    const next = !communityRoomsEnabled;
    setCommunityRoomsEnabled(next);
    localStorage.setItem('speakflow_community_rooms', String(next));
  };

  const getLevelTitle = (xp: number) => {
    if (xp < 100) return 'Explorer';
    if (xp < 300) return 'Beginner';
    if (xp < 600) return 'Learner';
    if (xp < 1000) return 'Speaker';
    if (xp < 1500) return 'Communicator';
    if (xp < 2200) return 'Professional';
    if (xp < 3000) return 'Advanced';
    if (xp < 4000) return 'Fluent';
    return 'Master';
  };

  const levelTitle = getLevelTitle(user?.xp || 0);

  // GitHub contribution grid simulator (7x15 squares)
  const renderCalendar = () => {
    const totalSquares = 105;
    const completedDaysSet = new Set(user?.completedLessons || []);
    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1 bg-brand-bg/50 p-4.5 rounded-2xl border border-brand-border justify-center">
        {Array.from({ length: totalSquares }).map((_, idx) => {
          let color = 'bg-gray-200 dark:bg-slate-700';
          if (idx % 11 === 0 || idx % 19 === 0) {
            color = 'bg-green-200 dark:bg-green-900';
          } else if (idx % 7 === 0 || idx % 15 === 0) {
            color = 'bg-green-400 dark:bg-green-700';
          } else if (idx < (user?.streak || 0) * 2 || completedDaysSet.size > idx % 15) {
            color = 'bg-green-600 dark:bg-green-500';
          }
          return (
            <div 
              key={idx}
              className={`w-3 h-3 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${color}`}
            />
          );
        })}
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = [];
    if ("nasa".includes(query)) results.push({ type: 'Vocabulary', title: 'NASA', desc: 'Space agency' });
    if ("planet".includes(query)) results.push({ type: 'Vocabulary', title: 'Planet', desc: 'Space orbit body' });
    if ("greetings".includes(query)) results.push({ type: 'Lesson Topic', title: 'Greetings & Polite Words', desc: 'Day 1 timeline topic' });
    setSearchResults(results);
  };

  // Recharts weekly XP dataset
  const weeklyData = [
    { name: 'Mon', XP: 45 },
    { name: 'Tue', XP: 80 },
    { name: 'Wed', XP: 65 },
    { name: 'Thu', XP: 110 },
    { name: 'Fri', XP: 90 },
    { name: 'Sat', XP: 140 },
    { name: 'Sun', XP: user?.xp ? Math.min(200, user.xp) : 100 },
  ];

  // Recharts Pronunciation Journey dataset
  const pronunciationJourneyData = [
    { week: 'Week 1', score: 72 },
    { week: 'Week 2', score: 79 },
    { week: 'Week 3', score: 84 },
    { week: 'Week 4', score: 91 }
  ];

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-24 text-brand-text-primary text-left">
      
      {/* HEADER SECTION */}
      <div className="space-y-1 text-left px-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">Profile Cockpit</h2>
        <p className="text-xs text-brand-text-secondary">Manage voice models, view pronunciation accent metrics, and certificates.</p>
      </div>

      {/* 1. PROFILE CARD */}
      <div className="card flex flex-col items-center text-center space-y-4 py-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary via-brand-accent to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg relative z-10">
            {user?.name.charAt(0) || 'S'}
          </div>
          <div className="absolute -inset-1 bg-brand-primary rounded-full blur opacity-25 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-text-primary">{user?.name}</h2>
          <p className="text-[10px] text-brand-text-muted font-mono">{user?.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50/10 text-indigo-500 border border-indigo-500/20 text-[9px] uppercase font-extrabold tracking-wider">
            Level {user?.level} • {levelTitle}
          </span>
        </div>

        <div className="flex items-center space-x-5 pt-3 border-t border-brand-border w-full justify-center text-xs font-bold text-brand-text-secondary">
          <div className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-brand-error fill-current animate-pulse" />
            <span>{user?.streak} days</span>
          </div>
          <div className="flex items-center space-x-1">
            <Coins className="w-4 h-4 text-brand-warning fill-current" />
            <span>{user?.coins} coins</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Lvl {user?.level}</span>
          </div>
        </div>
      </div>

      {/* 2. PRONUNCIATION ACCENT JOURNEY GRAPH */}
      <div className="card space-y-3.5">
        <div>
          <h4 className="font-bold text-sm text-brand-text-primary">Pronunciation Journey</h4>
          <p className="text-[10px] text-brand-text-secondary">Speaking clarity improvement graph tracking accent scores over weeks.</p>
        </div>
        
        <div className="w-full h-40 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pronunciationJourneyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPronScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-text-muted)" fontSize={9} tickLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={9} tickLine={false} domain={[50, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                labelStyle={{ fontSize: '10px' }}
                itemStyle={{ color: '#10B981', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPronScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. VOICE ACCENT SETTING */}
      <div className="card space-y-3">
        <div>
          <h4 className="font-bold text-sm text-brand-text-primary">Voice Accent Selector</h4>
          <p className="text-[10px] text-brand-text-secondary">Narrator voice configuration for study files.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['Emma (US)', 'John (US)', 'Indian English', 'British English'].map(voice => {
            const isSelected = voicePreference === voice;
            return (
              <button
                key={voice}
                onClick={() => handleVoiceChange(voice)}
                className={`p-3 rounded-xl border font-bold text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-brand-card border border-brand-border text-brand-text-secondary hover:border-indigo-300'
                }`}
              >
                <span>{voice}</span>
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. OPTIONAL COMMUNITY VOICE ROOMS TOGGLER */}
      <div className="card flex items-center justify-between !p-4 border border-brand-border">
        <div className="flex items-center space-x-2.5">
          <Users className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="text-left">
            <h4 className="font-bold text-xs text-brand-text-primary">Public Speaking Rooms</h4>
            <p className="text-[9px] text-brand-text-secondary">Allow suggestions to join public voice practice challenge rooms.</p>
          </div>
        </div>
        <button
          onClick={handleToggleCommunity}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-sm ${
            communityRoomsEnabled 
              ? 'bg-indigo-600 text-white border border-indigo-700' 
              : 'bg-brand-card border border-brand-border text-indigo-600 hover:bg-brand-surface'
          }`}
        >
          {communityRoomsEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* 4.5 PARENT / TEACHER MONITORING DASHBOARD */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h4 className="font-bold text-sm text-brand-text-primary">Parent / Teacher Portal</h4>
            <p className="text-[10px] text-brand-text-secondary">Track learning statistics and daily practice targets for your child.</p>
          </div>
          <button
            onClick={() => setShowParentPortal(!showParentPortal)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-sm ${
              showParentPortal 
                ? 'bg-indigo-600 text-white border border-indigo-600' 
                : 'bg-brand-card border border-brand-border text-indigo-600 hover:bg-brand-surface'
            }`}
          >
            {showParentPortal ? 'Hide Portal' : 'Show Portal'}
          </button>
        </div>

        {showParentPortal && (
          <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl space-y-3 animate-fade text-xs">
            <div className="grid grid-cols-2 gap-2 text-center text-brand-text-secondary">
              <div className="bg-brand-card border border-brand-border p-2.5 rounded-xl">
                <span className="text-[9px] text-brand-text-muted font-bold uppercase block">Weekly Time</span>
                <span className="font-bold text-brand-text-primary">78 minutes</span>
              </div>
              <div className="bg-brand-card border border-brand-border p-2.5 rounded-xl">
                <span className="text-[9px] text-brand-text-muted font-bold uppercase block">Drills Completed</span>
                <span className="font-bold text-brand-text-primary">{totalLessonsCount} Lessons</span>
              </div>
            </div>

            <div className="space-y-1 bg-brand-card border border-brand-border p-3 rounded-xl">
              <span className="text-[9px] text-brand-text-muted font-bold uppercase block">Weak Modules &amp; Vocabulary</span>
              <p className="text-[10px] text-brand-text-secondary mt-0.5">Present Continuous syntax rules, prepositions conjugation.</p>
            </div>

            <button
              onClick={() => alert("Weekly email reports digest has been successfully scheduled to your registered parent address!")}
              style={{ borderRadius: '10px', padding: '10px' }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1"
            >
              <span>Email Weekly Progress Digest</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. WEEKLY RECAP STORY */}
      <div className="card space-y-4 bg-gradient-to-br from-indigo-500/5 via-brand-card to-purple-500/5 border-indigo-500/10">
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <div>
            <h4 className="font-bold text-sm text-brand-text-primary">Weekly Achievement Story</h4>
            <p className="text-[10px] text-brand-text-secondary">Sunday wrap-up details.</p>
          </div>
          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Recap</span>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-brand-text-secondary">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-brand-bg rounded-xl"><span className="text-[9px] text-brand-text-muted font-bold uppercase block font-sans">Learned</span><span className="text-base font-black text-brand-text-primary">76 words</span></div>
            <div className="p-3 bg-brand-bg rounded-xl"><span className="text-[9px] text-brand-text-muted font-bold uppercase block font-sans">Speak Acc</span><span className="text-base font-black text-brand-text-primary">+14%</span></div>
            <div className="p-3 bg-brand-bg rounded-xl"><span className="text-[9px] text-brand-text-muted font-bold uppercase block font-sans">Lessons</span><span className="text-base font-black text-brand-text-primary">6 done</span></div>
          </div>
          <div className="space-y-1.5 pt-1.5 border-t border-brand-border text-[11px]">
            <p>🌟 **Strongest Skill:** Listening (dialogue comprehension speed is top-tier!)</p>
            <p>🔧 **Weakest Skill:** Grammar (Present Continuous exercises need review)</p>
            <p>🎯 **Next Week's Goal:** Past Tense prepositions conjugation</p>
          </div>
        </div>
      </div>

      {/* 6. MONTHLY ACCREDITATION CERTIFICATE */}
      <div className="card space-y-4">
        <div>
          <h3 className="font-bold text-sm text-brand-text-primary">Monthly Accreditation</h3>
          <p className="text-[10px] text-brand-text-secondary">Generated summary for active learning month.</p>
        </div>
        <div className="p-4 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-2xl space-y-4 text-center relative overflow-hidden select-none shadow-md">
          <div className="absolute top-2 right-2 text-3xl opacity-10 pointer-events-none">📜</div>
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest font-black bg-white/20 px-2 py-0.5 rounded-full inline-block">June 2026</span>
            <h4 className="text-base font-bold capitalize">{user?.name}</h4>
            <p className="text-[10px] text-white/80 leading-relaxed max-w-xs mx-auto">
              Completed 22 lessons with 82% Speaking accuracy and 90% Listening dialogue test scores. Verified credentials on the SpeakFlow learning blockchain.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            style={{ borderRadius: '12px', padding: '10px' }}
            className="w-full bg-white text-indigo-600 hover:bg-gray-50 active:scale-[0.99] text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Certificate PDF</span>
          </button>
        </div>
      </div>

      {/* 7. ACTIVITY GRID */}
      <div className="card space-y-3.5">
        <h4 className="font-bold text-sm text-brand-text-primary">Activity Map (105 Days)</h4>
        {renderCalendar()}
      </div>

      {/* 8. PRACTICE HISTORY */}
      <div className="card space-y-3.5 text-left">
        <div>
          <h4 className="font-bold text-sm text-brand-text-primary">Practice History</h4>
          <p className="text-[10px] text-brand-text-secondary">XP points earned during lessons this week.</p>
        </div>
        <div className="w-full h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={9} tickLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                labelStyle={{ fontSize: '10px' }}
                itemStyle={{ color: 'var(--color-primary)', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="XP" stroke="#6D5DF6" strokeWidth={2.5} fill="#6D5DF6" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 9. SETTINGS */}
      <div className="card space-y-4 text-left">
        <h3 className="font-bold text-sm text-brand-text-primary">System settings</h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-brand-surface border border-brand-border text-xs">
            <span className="font-semibold text-brand-text-secondary">Interface Theme</span>
            <button onClick={toggleTheme} className="flex items-center space-x-1.5 px-3 py-1 bg-brand-bg border border-brand-border rounded-lg font-bold text-brand-text-primary">
              {darkMode ? <Sun className="w-3.5 h-3.5 text-brand-warning" /> : <Moon className="w-3.5 h-3.5 text-brand-primary" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-between w-full p-3 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-error font-bold text-left">
            <span className="flex items-center space-x-1.5"><LogOut className="w-4.5 h-4.5 text-brand-error animate-pulse" /><span>Logout session</span></span>
          </button>
        </div>
      </div>

    </div>
  );
};
