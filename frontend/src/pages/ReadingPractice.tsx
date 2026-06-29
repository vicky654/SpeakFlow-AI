import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { BookOpenCheck, FileText, CheckCircle, Award, Sparkles, Send, Edit3, HelpCircle } from 'lucide-react';

export const ReadingPractice: React.FC = () => {
  const { lessons, fetchLessons, activeLesson, fetchLessonById, submitQuiz, submitWriting, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'quiz' | 'summary'>('quiz');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  // Summary Writing states
  const [summaryText, setSummaryText] = useState('');
  const [writingResult, setWritingResult] = useState<any | null>(null);

  useEffect(() => {
    fetchLessons('reading');
  }, [fetchLessons]);

  const selectStory = async (id: string) => {
    setQuizResult(null);
    setWritingResult(null);
    setSummaryText('');
    setSelectedAnswers({});
    setActiveWorkspaceTab('quiz');
    await fetchLessonById(id);

    // Log reading session start/practice time trigger (+45s)
    await useLearningStore.getState().logPracticeTime('reading', 45);
  };

  const handleSelectOption = (qId: string, opt: string) => {
    if (quizResult) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson) return;
    const questions = activeLesson.metadata.questions || [];
    
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const result = await submitQuiz(activeLesson._id, selectedAnswers);
    if (result) {
      setQuizResult(result);
      await useLearningStore.getState().logPracticeTime('reading', 60);
    }
  };

  const handleSubmitSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLesson || !summaryText.trim()) return;

    if (summaryText.trim().split(/\s+/).length < 10) {
      alert('Please write a longer summary (at least 10 words).');
      return;
    }

    const result = await submitWriting(
      `Summary of article: ${activeLesson.title}`,
      summaryText
    );
    if (result) {
      setWritingResult(result);
      await useLearningStore.getState().logPracticeTime('reading', 45);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <BookOpenCheck className="w-8 h-8 text-indigo-400" />
          <span>Reading Practice Hub</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Read curated articles, complete vocabulary quizzes, and write brief reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: LIST */}
        <div className="flex flex-col space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Articles & Stories</h3>
          
          <div className="space-y-3">
            {lessons.map(sc => (
              <div
                key={sc._id}
                onClick={() => selectStory(sc._id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeLesson?._id === sc._id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white'
                    : 'glass-card border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {sc.category}
                </span>
                <h4 className="font-bold text-sm mt-2 text-slate-200">{sc.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: READER & WORKSPACE */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {activeLesson ? (
            <div className="space-y-6">
              
              {/* READING STORY TEXT VIEW */}
              <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 space-y-4">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400">
                  {activeLesson.category}
                </span>
                <h2 className="text-2xl font-extrabold text-white leading-tight">{activeLesson.title}</h2>
                
                {/* Readable format content box */}
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-800/80 pt-4 font-sans max-h-80 overflow-y-auto pr-2">
                  {activeLesson.content.replace(/#\s+.+/g, '')} {/* strip out duplicates headers if any */}
                </div>
              </div>

              {/* STUDY TABS */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveWorkspaceTab('quiz')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeWorkspaceTab === 'quiz' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Comprehension Quiz</span>
                </button>
                <button
                  onClick={() => setActiveWorkspaceTab('summary')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeWorkspaceTab === 'summary' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Summary Writing</span>
                </button>
              </div>

              {/* COMPREHENSION QUIZ TAB */}
              {activeWorkspaceTab === 'quiz' && (
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
                  <div className="space-y-6">
                    {activeLesson.metadata.questions?.map((q, idx) => (
                      <div key={q.id} className="space-y-3">
                        <p className="text-sm font-bold text-slate-300">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, i) => {
                            const isSelected = selectedAnswers[q.id] === opt;
                            const isCorrect = q.answer === opt;
                            let btnClass = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-indigo-500/40';

                            if (isSelected) {
                              btnClass = 'bg-indigo-600 border-indigo-500 text-white shadow-md';
                            }

                            if (quizResult) {
                              if (isCorrect) {
                                btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                              } else if (isSelected) {
                                btnClass = 'bg-rose-500/20 border-rose-500 text-rose-400 line-through';
                              } else {
                                btnClass = 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={i}
                                disabled={quizResult !== null}
                                onClick={() => handleSelectOption(q.id, opt)}
                                className={`p-3 text-left text-xs font-semibold rounded-xl border transition-all leading-relaxed ${btnClass}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizResult ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/25 mt-4"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                      quizResult.passed 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                    }`}>
                      <div className="flex items-center justify-center space-x-2 font-bold text-base">
                        <Award className="w-5 h-5" />
                        <span>{quizResult.passed ? 'Quiz Passed! 🎉' : 'Quiz Incomplete'}</span>
                      </div>
                      <p className="text-xs">
                        You scored <span className="font-extrabold">{quizResult.score}%</span> accuracy.
                        Earned <span className="font-bold text-indigo-400">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-400">+{quizResult.coinsGained} Coins</span>!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUMMARY WRITING TAB */}
              {activeWorkspaceTab === 'summary' && (
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-200">Submit a Story Summary</h3>
                    <p className="text-[11px] text-slate-400">Write a brief 1-3 sentence summary of what you read. Our parser will evaluate sentence spelling, case structure, and length.</p>
                  </div>

                  <form onSubmit={handleSubmitSummary} className="space-y-4">
                    <textarea
                      disabled={writingResult !== null}
                      placeholder="Write your summary here... (e.g. Emails are essential in corporate systems. We should construct neat subject lines and keep requests direct.)"
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      className="w-full h-32 p-4 bg-slate-905 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans leading-relaxed resize-none"
                    />

                    {!writingResult ? (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Summary</span>
                      </button>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Evaluation Score</span>
                            <p className="text-xl font-extrabold text-indigo-400 mt-0.5">{writingResult.score} / 100</p>
                          </div>
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            +{writingResult.xpGained} XP • +{writingResult.coinsGained} Coins
                          </span>
                        </div>

                        <div className="space-y-2 text-left">
                          <h4 className="text-xs font-bold text-slate-300">Writing Analysis Details:</h4>
                          {writingResult.feedback.map((f: string, i: number) => (
                            <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed">
                              {f}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => { setWritingResult(null); setSummaryText(''); }}
                          className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Rewrite / Practice Again
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="h-96 glass-card rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-4xl">📖</span>
              <h3 className="text-lg font-bold text-slate-200">Reader Workspace</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an article or business report from the list on the left to start reading and test your analytical vocabulary skills.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
