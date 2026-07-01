import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { BookOpenCheck, FileText, CheckCircle, Award, Sparkles, Send, Edit3, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-6 select-none max-w-5xl mx-auto pb-6">
      
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-brand-text-primary flex items-center gap-2">
          <BookOpenCheck className="w-6 h-6 text-indigo-500" />
          <span>Reading Practice Hub</span>
        </h2>
        <p className="text-xs text-brand-text-secondary">Read curated articles, complete vocabulary quizzes, and write brief reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: LIST */}
        <div className="flex flex-col space-y-3 lg:col-span-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Articles & Stories</span>
          
          <div className="space-y-2">
            {lessons.map(sc => {
              const isActive = activeLesson?._id === sc._id;
              return (
                <button
                  key={sc._id}
                  onClick={() => selectStory(sc._id)}
                  className={`w-full text-left card !p-4 transition-all active:scale-[0.99] flex items-center gap-3 ${
                    isActive ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div className="w-1 self-stretch rounded-full bg-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-55/10 text-indigo-500 border border-indigo-500/20 uppercase">
                      {sc.category}
                    </span>
                    <h4 className="font-semibold text-[13px] text-brand-text-primary mt-1 line-clamp-1 leading-snug">{sc.title}</h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-brand-text-muted'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: READER & WORKSPACE */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {activeLesson ? (
            <div className="space-y-6">
              
              {/* READING STORY TEXT VIEW */}
              <div className="card space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">
                  {activeLesson.category}
                </span>
                <h2 className="text-xl font-bold text-brand-text-primary leading-tight">{activeLesson.title}</h2>
                
                {/* Readable format content box */}
                <div className="text-brand-text-secondary text-sm leading-relaxed whitespace-pre-line border-t border-brand-border pt-4 font-sans max-h-80 overflow-y-auto pr-2">
                  {activeLesson.content.replace(/#\s+.+/g, '')}
                </div>
              </div>

              {/* STUDY TABS */}
              <div className="tab-bar">
                <button
                  onClick={() => setActiveWorkspaceTab('quiz')}
                  className={`tab-btn ${activeWorkspaceTab === 'quiz' ? 'active' : ''}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Comprehension Quiz</span>
                </button>
                <button
                  onClick={() => setActiveWorkspaceTab('summary')}
                  className={`tab-btn ${activeWorkspaceTab === 'summary' ? 'active' : ''}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Summary Writing</span>
                </button>
              </div>

              {/* COMPREHENSION QUIZ TAB */}
              {activeWorkspaceTab === 'quiz' && (
                <div className="card space-y-6">
                  <div className="space-y-6">
                    {activeLesson.metadata.questions?.map((q, idx) => (
                      <div key={q.id} className="space-y-3">
                        <p className="text-[13px] font-semibold text-brand-text-primary leading-snug">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, i) => {
                            const isSelected = selectedAnswers[q.id] === opt;
                            const isCorrect = q.answer === opt;

                            let optClass = 'bg-brand-card border-brand-border text-brand-text-primary hover:border-indigo-500/60 hover:bg-indigo-500/5';
                            let prefixClass = 'bg-brand-surface border border-brand-border text-brand-text-secondary';

                            if (isSelected && !quizResult) {
                              optClass = 'bg-indigo-600 border-indigo-600 text-white shadow-sm';
                              prefixClass = 'bg-white/20 text-white';
                            }

                            if (quizResult) {
                              if (isCorrect) {
                                optClass = 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-500 font-bold';
                                prefixClass = 'bg-emerald-500/20 text-emerald-400';
                              } else if (isSelected) {
                                optClass = 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 text-rose-500 line-through';
                                prefixClass = 'bg-rose-500/20 text-rose-450';
                              } else {
                                optClass = 'bg-brand-bg/40 border-brand-border text-brand-text-muted opacity-40';
                                prefixClass = 'bg-brand-surface text-brand-text-muted';
                              }
                            }

                            const letters = ['A', 'B', 'C', 'D'];
                            return (
                              <button
                                key={i}
                                disabled={quizResult !== null}
                                onClick={() => handleSelectOption(q.id, opt)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-[13px] transition-all active:scale-[0.99] ${optClass}`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${prefixClass}`}>
                                  {letters[i]}
                                </span>
                                <span className="leading-snug">{opt}</span>
                                {quizResult && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                                )}
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
                      style={{ borderRadius: '12px', padding: '14px' }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                      quizResult.passed 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                      <div className="flex items-center justify-center gap-2 font-bold text-sm">
                        <Award className="w-4.5 h-4.5" />
                        <span>{quizResult.passed ? 'Quiz Passed! 🎉' : 'Quiz Incomplete'}</span>
                      </div>
                      <p className="text-xs">
                        You scored <span className="font-bold">{quizResult.score}%</span> accuracy.<br />
                        Earned <span className="font-bold text-indigo-600">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-500">+{quizResult.coinsGained} Coins</span>!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SUMMARY WRITING TAB */}
              {activeWorkspaceTab === 'summary' && (
                <div className="card space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-brand-text-primary text-sm">Submit a Story Summary</h3>
                    <p className="text-[11px] text-brand-text-secondary leading-normal">Write a brief 1-3 sentence summary of what you read. Our parser will evaluate sentence spelling, case structure, and length.</p>
                  </div>

                  <form onSubmit={handleSubmitSummary} className="space-y-4">
                    <textarea
                      disabled={writingResult !== null}
                      placeholder="Write your summary here... (e.g. Emails are essential in corporate systems. We should construct neat subject lines and keep requests direct.)"
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      className="w-full h-32 p-4 bg-brand-surface border border-brand-border rounded-2xl text-xs text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans leading-relaxed resize-none"
                    />

                    {!writingResult ? (
                      <button
                        type="submit"
                        disabled={loading}
                        style={{ borderRadius: '12px', padding: '14px' }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Summary</span>
                      </button>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center bg-brand-card border border-brand-border p-4 rounded-2xl">
                          <div className="text-left">
                            <span className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">Evaluation Score</span>
                            <p className="text-xl font-extrabold text-indigo-600 mt-0.5">{writingResult.score} / 100</p>
                          </div>
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            +{writingResult.xpGained} XP • +{writingResult.coinsGained} Coins
                          </span>
                        </div>

                        <div className="space-y-2 text-left">
                          <h4 className="text-xs font-bold text-brand-text-secondary">Writing Analysis Details:</h4>
                          {writingResult.feedback.map((f: string, i: number) => (
                            <div key={i} className="p-3 bg-brand-surface/45 border border-brand-border rounded-xl text-xs text-brand-text-secondary leading-relaxed">
                              {f}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => { setWritingResult(null); setSummaryText(''); }}
                          style={{ borderRadius: '12px', padding: '10px' }}
                          className="w-full bg-white border border-gray-200 text-brand-text-secondary hover:bg-gray-50 text-xs font-bold transition-all"
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
            <div className="card flex flex-col items-center justify-center text-center py-12 space-y-4">
              <span className="text-4xl">📖</span>
              <h3 className="text-sm font-bold text-brand-text-primary">Reader Workspace</h3>
              <p className="text-xs text-brand-text-muted max-w-sm">
                Select an article or business story from the list on the left to start reading and test your analytical vocabulary skills.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
