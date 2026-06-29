import React, { useState, useEffect } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, BarChart3, Plus, Trash2, CheckCircle2, ListFilter, AlertCircle, BookOpen, LayoutList } from 'lucide-react';
import { Lesson, Word } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    adminAddVocab, adminAddLesson, adminDeleteVocab, adminDeleteLesson, 
    allWords, lessons, fetchLessons, fetchAllWords, fetchAdminStats 
  } = useLearningStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'stats' | 'vocab' | 'lesson' | 'manage'>('stats');
  const [stats, setStats] = useState<any | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states: Vocab
  const [vocabForm, setVocabForm] = useState({
    word: '', pronunciation: '', partOfSpeech: 'Adjective',
    englishMeaning: '', hindiMeaning: '', synonyms: '', antonyms: '',
    example1: '', example2: '', commonMistakes: '', memoryTrick: '', realLifeUsage: ''
  });

  // Form states: Lesson
  const [lessonType, setLessonType] = useState<'grammar' | 'reading' | 'listening' | 'interview'>('grammar');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonCategory, setLessonCategory] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  
  // Quiz states inside Lesson
  const [q1Question, setQ1Question] = useState('');
  const [q1Opt1, setQ1Opt1] = useState('');
  const [q1Opt2, setQ1Opt2] = useState('');
  const [q1Opt3, setQ1Opt3] = useState('');
  const [q1Opt4, setQ1Opt4] = useState('');
  const [q1Answer, setQ1Answer] = useState('');
  const [q1Explanation, setQ1Explanation] = useState('');

  const loadAdminStats = async () => {
    const res = await fetchAdminStats();
    if (res) {
      setStats(res);
    }
  };

  useEffect(() => {
    loadAdminStats();
    fetchAllWords();
    fetchLessons('grammar'); // fetch preloaded lessons
  }, [activeAdminTab]);

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setAlertInfo({ type, message });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // HANDLERS: CREATE VOCAB
  const handleCreateVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabForm.word || !vocabForm.englishMeaning || !vocabForm.hindiMeaning) {
      triggerAlert('error', 'Please fill in word, English meaning, and Hindi meaning.');
      return;
    }

    const payload: Partial<Word> = {
      word: vocabForm.word,
      pronunciation: vocabForm.pronunciation || '/.../',
      partOfSpeech: vocabForm.partOfSpeech,
      englishMeaning: vocabForm.englishMeaning,
      hindiMeaning: vocabForm.hindiMeaning,
      synonyms: vocabForm.synonyms ? vocabForm.synonyms.split(',').map(s => s.trim()) : [],
      antonyms: vocabForm.antonyms ? vocabForm.antonyms.split(',').map(s => s.trim()) : [],
      exampleSentences: [
        vocabForm.example1 || 'He is confident during discussions.',
        vocabForm.example2 || 'It is an important concept.'
      ].filter(s => s.trim() !== ''),
      commonMistakes: vocabForm.commonMistakes || 'N/A',
      memoryTrick: vocabForm.memoryTrick || 'N/A',
      realLifeUsage: vocabForm.realLifeUsage || 'N/A'
    };

    const success = await adminAddVocab(payload);
    if (success) {
      triggerAlert('success', `Vocabulary word "${vocabForm.word}" added successfully!`);
      setVocabForm({
        word: '', pronunciation: '', partOfSpeech: 'Adjective',
        englishMeaning: '', hindiMeaning: '', synonyms: '', antonyms: '',
        example1: '', example2: '', commonMistakes: '', memoryTrick: '', realLifeUsage: ''
      });
      fetchAllWords();
    } else {
      triggerAlert('error', 'Failed to add vocabulary word. Make sure it is unique.');
    }
  };

  // HANDLERS: CREATE LESSON
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonCategory || !lessonContent) {
      triggerAlert('error', 'Please provide a title, category, and markdown content.');
      return;
    }

    const payload: Partial<Lesson> = {
      type: lessonType,
      title: lessonTitle,
      category: lessonCategory,
      content: lessonContent,
      metadata: {
        questions: q1Question ? [
          {
            id: 'q1',
            question: q1Question,
            options: [q1Opt1, q1Opt2, q1Opt3, q1Opt4].filter(o => o.trim() !== ''),
            answer: q1Answer || q1Opt1,
            explanation: q1Explanation || ''
          }
        ] : [],
        suggestedAnswers: lessonType === 'interview' ? ['This is a suggested mock response templates.'] : [],
        tips: lessonType === 'interview' ? ['Inject achievements and structured frameworks.'] : []
      }
    };

    const success = await adminAddLesson(payload);
    if (success) {
      triggerAlert('success', `Lesson "${lessonTitle}" of type "${lessonType}" created!`);
      setLessonTitle('');
      setLessonCategory('');
      setLessonContent('');
      setQ1Question('');
      setQ1Opt1('');
      setQ1Opt2('');
      setQ1Opt3('');
      setQ1Opt4('');
      setQ1Answer('');
      setQ1Explanation('');
    } else {
      triggerAlert('error', 'Failed to create lesson. Server error.');
    }
  };

  const handleDeleteVocabItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary word?')) return;
    const ok = await adminDeleteVocab(id);
    if (ok) {
      triggerAlert('success', 'Word deleted successfully.');
      fetchAllWords();
    } else {
      triggerAlert('error', 'Failed to delete vocab.');
    }
  };

  const handleDeleteLessonItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course lesson?')) return;
    const ok = await adminDeleteLesson(id);
    if (ok) {
      triggerAlert('success', 'Lesson deleted successfully.');
      fetchLessons('grammar'); // Refresh default list
    } else {
      triggerAlert('error', 'Failed to delete lesson.');
    }
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Manage dictionary bases, append course curriculums, and audit stats metrics.</p>
        </div>
      </div>

      {alertInfo && (
        <div className={`p-4 rounded-xl text-xs flex items-start space-x-2 border transition-all ${
          alertInfo.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {alertInfo.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* ADMIN TABS */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveAdminTab('stats')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'stats' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Stats
        </button>
        <button
          onClick={() => setActiveAdminTab('vocab')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'vocab' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Add Vocabulary
        </button>
        <button
          onClick={() => setActiveAdminTab('lesson')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'lesson' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Add Course Lesson
        </button>
        <button
          onClick={() => setActiveAdminTab('manage')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'manage' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Manage Content
        </button>
      </div>

      {/* 1. PLATFORM STATS PANEL */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-6">
          {stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Registered Users</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{stats.summary.users}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Vocabulary base</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{stats.summary.vocabulary} words</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-slate-800 text-left">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Curriculum Lessons</span>
                  <p className="text-3xl font-extrabold text-white mt-1">{stats.summary.lessons} units</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users Roles Breakdown */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 text-left">
                  <h3 className="font-extrabold text-sm text-slate-200 flex items-center space-x-1.5">
                    <LayoutList className="w-4.5 h-4.5 text-rose-500" />
                    <span>User Roles Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-850">
                      <span className="text-slate-400">Students</span>
                      <span className="font-bold text-white">{stats.roles.student}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-850">
                      <span className="text-slate-400">Working Professionals</span>
                      <span className="font-bold text-white">{stats.roles.professional}</span>
                    </div>
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-850">
                      <span className="text-slate-400">Job Seekers</span>
                      <span className="font-bold text-white">{stats.roles.jobSeeker}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Administrators</span>
                      <span className="font-bold text-white">{stats.roles.admin}</span>
                    </div>
                  </div>
                </div>

                {/* Engagement indicators */}
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 text-left">
                  <h3 className="font-extrabold text-sm text-slate-200 flex items-center space-x-1.5">
                    <BarChart3 className="w-4.5 h-4.5 text-rose-500" />
                    <span>Engagement Metrics</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs pb-1 border-b border-slate-850">
                      <span className="text-slate-400">Platform Total XP</span>
                      <span className="font-bold text-indigo-400">{stats.metrics.totalXp} XP</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Average Streak Duration</span>
                      <span className="font-bold text-orange-500">{stats.metrics.averageStreak} Days</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-500">
              Loading platform data logs...
            </div>
          )}
        </div>
      )}

      {/* 2. ADD VOCABULARY FORM */}
      {activeAdminTab === 'vocab' && (
        <form onSubmit={handleCreateVocab} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 text-left">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Add New Word details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Word</label>
              <input
                type="text" required placeholder="Resilience"
                value={vocabForm.word}
                onChange={e => setVocabForm({...vocabForm, word: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500/60"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Pronunciation Guide</label>
              <input
                type="text" placeholder="/rɪˈzɪlɪəns/"
                value={vocabForm.pronunciation}
                onChange={e => setVocabForm({...vocabForm, pronunciation: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Part of Speech</label>
              <select
                value={vocabForm.partOfSpeech}
                onChange={e => setVocabForm({...vocabForm, partOfSpeech: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="Adjective">Adjective</option>
                <option value="Noun">Noun</option>
                <option value="Verb">Verb</option>
                <option value="Adverb">Adverb</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">English Definition</label>
              <input
                type="text" required placeholder="The capacity to recover quickly from difficulties."
                value={vocabForm.englishMeaning}
                onChange={e => setVocabForm({...vocabForm, englishMeaning: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Hindi Definition</label>
              <input
                type="text" required placeholder="लचीलापन"
                value={vocabForm.hindiMeaning}
                onChange={e => setVocabForm({...vocabForm, hindiMeaning: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Synonyms (comma separated)</label>
              <input
                type="text" placeholder="Grit, Toughness, Flexibility"
                value={vocabForm.synonyms}
                onChange={e => setVocabForm({...vocabForm, synonyms: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Antonyms (comma separated)</label>
              <input
                type="text" placeholder="Fragility, Weakness"
                value={vocabForm.antonyms}
                onChange={e => setVocabForm({...vocabForm, antonyms: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Example Sentence 1</label>
              <input
                type="text" placeholder="The team showed great resilience after losing."
                value={vocabForm.example1}
                onChange={e => setVocabForm({...vocabForm, example1: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Example Sentence 2</label>
              <input
                type="text" placeholder="Nylon is notable for its resilience."
                value={vocabForm.example2}
                onChange={e => setVocabForm({...vocabForm, example2: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Memory Trick</label>
              <input
                type="text" placeholder="re-silence (pause to recover calm)"
                value={vocabForm.memoryTrick}
                onChange={e => setVocabForm({...vocabForm, memoryTrick: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Common Mistake</label>
              <input
                type="text" placeholder="Do not write with an 'a' - resiliance."
                value={vocabForm.commonMistakes}
                onChange={e => setVocabForm({...vocabForm, commonMistakes: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Real-life Usage</label>
              <input
                type="text" placeholder="performance evaluations, retro reviews"
                value={vocabForm.realLifeUsage}
                onChange={e => setVocabForm({...vocabForm, realLifeUsage: e.target.value})}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Create Vocabulary Card</span>
          </button>
        </form>
      )}

      {/* 3. ADD LESSON FORM */}
      {activeAdminTab === 'lesson' && (
        <form onSubmit={handleCreateLesson} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 text-left">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Add New Lesson Unit</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Lesson Category Type</label>
              <select
                value={lessonType}
                onChange={e => setLessonType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="grammar">Grammar Course</option>
                <option value="reading">Reading Practice</option>
                <option value="listening">Listening Practice</option>
                <option value="interview">Interview Preparation</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Lesson Title</label>
              <input
                type="text" required placeholder="e.g. Master Subject-Verb Agreement"
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Syllabus Topic Category</label>
            <input
              type="text" required placeholder="e.g. Tenses, Business Presentations, Office Emails"
              value={lessonCategory}
              onChange={e => setLessonCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Lesson Content (Supports Text / Markdown)</label>
            <textarea
              required placeholder="# Title Here&#10;&#10;Use markdown headers and list points to build structured courses."
              value={lessonContent}
              onChange={e => setLessonContent(e.target.value)}
              className="w-full h-36 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none resize-none"
            />
          </div>

          {/* QUIZ FORM WIDGET */}
          <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Configure Lesson Question 1 (Optional)</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-500">Question Text</label>
              <input
                type="text" placeholder="Identify the correct sentence structure:"
                value={q1Question}
                onChange={e => setQ1Question(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" placeholder="Option A"
                value={q1Opt1}
                onChange={e => setQ1Opt1(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-250 focus:outline-none"
              />
              <input
                type="text" placeholder="Option B"
                value={q1Opt2}
                onChange={e => setQ1Opt2(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-250 focus:outline-none"
              />
              <input
                type="text" placeholder="Option C"
                value={q1Opt3}
                onChange={e => setQ1Opt3(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-250 focus:outline-none"
              />
              <input
                type="text" placeholder="Option D"
                value={q1Opt4}
                onChange={e => setQ1Opt4(e.target.value)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-250 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Correct Option Match Text</label>
                <input
                  type="text" placeholder="Must exactly match correct option text"
                  value={q1Answer}
                  onChange={e => setQ1Answer(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Explanation Note</label>
                <input
                  type="text" placeholder="E.g. We use singular verbs for collective singular nouns."
                  value={q1Explanation}
                  onChange={e => setQ1Explanation(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center space-x-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Create Curriculum Lesson</span>
          </button>
        </form>
      )}

      {/* 4. MANAGE CONTENT SUB-PANEL */}
      {activeAdminTab === 'manage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* DICTIONARY MANAGEMENT */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-250 flex items-center space-x-2">
              <BookOpen className="w-4.5 h-4.5 text-rose-400" />
              <span>Vocabulary Dictionary ({allWords.length})</span>
            </h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {allWords.map(w => (
                <div key={w._id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="text-left font-bold text-slate-200">
                    {w.word} <span className="text-[10px] text-slate-500 font-normal">({w.partOfSpeech})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteVocabItem(w._id)}
                    className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CURRICULUM MANAGEMENT */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-250 flex items-center space-x-2">
              <LayoutList className="w-4.5 h-4.5 text-rose-400" />
              <span>Curriculum Syllabus Chapters ({lessons.length})</span>
            </h3>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {lessons.map(les => (
                <div key={les._id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="text-left">
                    <p className="font-bold text-slate-200 truncate max-w-xs">{les.title}</p>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{les.type} • {les.category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLessonItem(les._id)}
                    className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
