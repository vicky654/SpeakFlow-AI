import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Award, BookOpen, CheckCircle, ChevronRight, HelpCircle, ArrowLeft, RefreshCw, Star, CheckCircle2 } from 'lucide-react';

export const GrammarCourse: React.FC = () => {
  const { lessons, fetchLessons, activeLesson, fetchLessonById, submitQuiz, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  useEffect(() => {
    fetchLessons('grammar');
  }, [fetchLessons]);

  const handleStartChapter = async (id: string) => {
    setQuizResult(null);
    setSelectedAnswers({});
    await fetchLessonById(id);
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
    }
  };

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto pb-6">
      
      {/* HEADER ROW */}
      <div className="flex items-center gap-3">
        {activeLesson && (
          <button
            onClick={() => useLearningStore.setState({ activeLesson: null })}
            style={{ borderRadius: '12px', padding: '8px' }}
            className="bg-brand-card border border-brand-border text-brand-text-secondary hover:bg-brand-surface transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-brand-text-primary flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            <span>Grammar Academy</span>
          </h2>
          <p className="text-xs text-brand-text-secondary">
            {activeLesson ? `Studying: ${activeLesson.title}` : 'Climb the grammar ranks, master sentence mechanics, and clear milestones.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-brand-text-secondary">Loading syllabus units...</p>
        </div>
      ) : !activeLesson ? (
        
        /* SYLLABUS TIMELINE MAP */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Course Curriculum Map</span>
            
            <div className="relative border-l-2 border-indigo-500/25 ml-4 pl-8 space-y-6">
              {lessons.map((les, index) => {
                const isCompleted = user?.completedLessons.includes(les._id);
                // Simple progression block: first card is always unlocked, otherwise unlocked if previous is completed.
                const isUnlocked = index === 0 || user?.completedLessons.includes(lessons[index - 1]?._id);

                return (
                  <div key={les._id} className="relative">
                    {/* Progress timeline dot node */}
                    <div className={`absolute -left-12 top-2.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                        : isUnlocked 
                          ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' 
                          : 'bg-brand-surface border-brand-border text-brand-text-muted'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    <div className={`card transition-all ${
                      isUnlocked 
                        ? 'hover:shadow-md hover:scale-[1.01]' 
                        : 'opacity-60'
                    }`}>
                      <div className="flex justify-between items-center gap-4">
                        <div className="space-y-1.5 text-left min-w-0 flex-1">
                          <span className="text-[10px] uppercase font-bold text-indigo-500">
                            Module {index + 1} • {les.category}
                          </span>
                          <h4 className="font-semibold text-sm text-brand-text-primary truncate">{les.title}</h4>
                          <p className="text-[11px] text-brand-text-secondary leading-tight line-clamp-1">Includes core formulas, real-world examples, and quiz check.</p>
                        </div>

                        <button
                          disabled={!isUnlocked}
                          onClick={() => handleStartChapter(les._id)}
                          style={{ borderRadius: '999px', padding: '8px 18px' }}
                          className={`flex items-center gap-1 text-xs font-bold transition-all shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                              : isUnlocked
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span>{isCompleted ? 'Review' : 'Start'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR PANEL */}
          <div className="md:col-span-1 space-y-6">
            {/* Progress summary statistics */}
            <div className="card space-y-4">
              <h3 className="font-bold text-sm text-brand-text-primary">Academy Progress</h3>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-brand-text-secondary">Syllabus Completion</span>
                <span className="text-indigo-600">
                  {user?.completedLessons.length || 0} / {lessons.length} Modules
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((user?.completedLessons.length || 0) / Math.max(1, lessons.length)) * 100)}%` }}
                />
              </div>

              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-brand-text-secondary space-y-2 leading-relaxed">
                <p className="font-bold text-brand-text-secondary flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Grammar Rules:</span>
                </p>
                <p>Complete each module to unlock the next one. Passing a quiz awards +50 XP points.</p>
              </div>
            </div>
          </div>

        </div>

      ) : (

        /* STUDY WORKSPACE ACTIVE LESSON */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LESSON STUDY TEXT */}
          <div className="lg:col-span-2 card space-y-5 max-h-[75vh] overflow-y-auto pr-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">
              Grammar • {activeLesson.category}
            </span>
            <div className="text-brand-text-primary text-sm leading-relaxed font-sans">
              <h2 className="text-xl font-bold text-brand-text-primary mb-3">{activeLesson.title}</h2>
              <div className="border-t border-brand-border pt-4 whitespace-pre-line text-brand-text-secondary">
                {activeLesson.content.replace(/#\s+.+/g, '')}
              </div>
            </div>
          </div>

          {/* LESSON QUIZ CARD */}
          <div className="lg:col-span-1 card space-y-5">
            <h3 className="font-bold text-sm text-brand-text-primary flex items-center gap-2 border-b border-brand-border pb-3">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-500" />
              <span>Chapter Quiz</span>
            </h3>

            <div className="space-y-5">
              {activeLesson.metadata.questions?.map((q, idx) => (
                <div key={q.id} className="space-y-3 text-left">
                  <p className="text-[13px] font-semibold text-brand-text-primary leading-snug">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
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
                Submit Answers
              </button>
            ) : (
              <div className={`p-4 rounded-2xl border text-center space-y-2.5 ${
                quizResult.passed 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <span>{quizResult.passed ? 'Passed! 🎉' : 'Incomplete'}</span>
                </div>
                <p className="text-xs">
                  Scored {quizResult.score}% accuracy.<br />
                  Earned <span className="font-bold text-indigo-600">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-500">+{quizResult.coinsGained} Coins</span>!
                </p>
                <button
                  onClick={() => { setQuizResult(null); setSelectedAnswers({}); }}
                  style={{ borderRadius: '12px', padding: '10px' }}
                  className="w-full bg-white border border-gray-200 text-brand-text-secondary hover:bg-gray-50 text-xs font-bold transition-all mt-2"
                >
                  Retry Quiz
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
