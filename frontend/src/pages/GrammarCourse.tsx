import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Award, BookOpen, CheckCircle, ChevronRight, HelpCircle, ArrowLeft, RefreshCw, Star } from 'lucide-react';

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
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER ROW */}
      <div className="flex items-center space-x-3">
        {activeLesson && (
          <button
            onClick={() => useLearningStore.setState({ activeLesson: null })}
            className="p-2 bg-brand-card border border-brand-border rounded-xl text-brand-text-secondary hover:text-white transition-all mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <Award className="w-8 h-8 text-indigo-400" />
            <span>Grammar Academy</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-1">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider pl-1 font-sans">Course Curriculum Map</h3>
            
            <div className="relative border-l-2 border-indigo-500/25 ml-4 pl-8 space-y-8">
              {lessons.map((les, index) => {
                const isCompleted = user?.completedLessons.includes(les._id);
                // Simple progression block: first card is always unlocked, otherwise unlocked if previous is completed.
                const isUnlocked = index === 0 || user?.completedLessons.includes(lessons[index - 1]?._id);

                return (
                  <div key={les._id} className="relative">
                    {/* Progress timeline dot node */}
                    <div className={`absolute -left-12 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                        : isUnlocked 
                          ? 'bg-indigo-600 border-indigo-400 text-white animate-pulse' 
                          : 'bg-brand-card border-brand-border text-brand-text-muted'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    <div className={`p-5 rounded-3xl bg-brand-card border border-brand-border shadow-level-1 border transition-all ${
                      isUnlocked 
                        ? 'border-brand-border hover:border-indigo-500/50 hover:scale-[1.01]' 
                        : 'border-brand-border/60 opacity-60'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5 text-left">
                          <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">
                            Module {index + 1} • {les.category}
                          </span>
                          <h4 className="font-extrabold text-base text-brand-text-primary">{les.title}</h4>
                          <p className="text-[11px] text-brand-text-secondary">Includes core formulas, real-world examples, and 2-question quiz check.</p>
                        </div>

                        <button
                          disabled={!isUnlocked}
                          onClick={() => handleStartChapter(les._id)}
                          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              : isUnlocked
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                                : 'bg-brand-surface border border-brand-border text-brand-text-muted cursor-not-allowed'
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
            <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-6 border border-brand-border space-y-4">
              <h3 className="font-extrabold text-brand-text-primary">Academy Progress</h3>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-brand-text-secondary">Syllabus Completion</span>
                <span className="text-indigo-400">
                  {user?.completedLessons.length || 0} / {lessons.length} Modules
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-3 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((user?.completedLessons.length || 0) / Math.max(1, lessons.length)) * 100)}%` }}
                />
              </div>

              <div className="p-4 bg-brand-surface/60 border border-brand-border rounded-2xl text-[11px] text-brand-text-secondary space-y-2 leading-relaxed">
                <p className="font-semibold text-brand-text-secondary flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Grammar Rules:</span>
                </p>
                <p>Complete each module to unlock the next one. Passing a quiz with &gt;= 80% accuracy awards +50 XP points.</p>
              </div>
            </div>
          </div>

        </div>

      ) : (

        /* STUDY WORKSPACE ACTIVE LESSON */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LESSON STUDY TEXT */}
          <div className="lg:col-span-2 bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-6 md:p-8 border border-brand-border space-y-6 max-h-[75vh] overflow-y-auto pr-3">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400">
              Grammar • {activeLesson.category}
            </span>
            <div className="text-brand-text-primary text-sm leading-relaxed prose prose-invert font-sans markdown-content">
              {/* Parse headers into clean margins */}
              <h2 className="text-2xl font-extrabold text-white mb-4">{activeLesson.title}</h2>
              <div className="border-t border-brand-border pt-4 whitespace-pre-line text-brand-text-secondary">
                {activeLesson.content.replace(/#\s+.+/g, '')}
              </div>
            </div>
          </div>

          {/* LESSON QUIZ CARD */}
          <div className="lg:col-span-1 bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-6 border border-brand-border space-y-6">
            <h3 className="font-extrabold text-brand-text-primary flex items-center space-x-2 border-b border-brand-border pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Chapter Quiz</span>
            </h3>

            <div className="space-y-6">
              {activeLesson.metadata.questions?.map((q, idx) => (
                <div key={q.id} className="space-y-3 text-left">
                  <p className="text-xs font-bold text-brand-text-secondary">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="flex flex-col space-y-2">
                    {q.options.map((opt, i) => {
                      const isSelected = selectedAnswers[q.id] === opt;
                      const isCorrect = q.answer === opt;
                      let btnClass = 'bg-brand-surface/60 border-brand-border text-brand-text-secondary hover:border-indigo-500/40';

                      if (isSelected) {
                        btnClass = 'bg-indigo-600 border-indigo-500 text-white shadow-md';
                      }

                      if (quizResult) {
                        if (isCorrect) {
                          btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold';
                        } else if (isSelected) {
                          btnClass = 'bg-rose-500/20 border-rose-500 text-rose-400 line-through';
                        } else {
                          btnClass = 'bg-brand-card/45 border-brand-border text-brand-text-muted opacity-60';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={quizResult !== null}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`p-2.5 text-left text-[11px] font-semibold rounded-xl border transition-all leading-relaxed ${btnClass}`}
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
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 mt-4"
              >
                Submit Answers
              </button>
            ) : (
              <div className={`p-4 rounded-2xl border text-center space-y-2.5 ${
                quizResult.passed 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <div className="flex items-center justify-center space-x-1.5 font-bold text-sm">
                  <span>{quizResult.passed ? 'Passed! 🎉' : 'Incomplete'}</span>
                </div>
                <p className="text-[11px]">
                  Scored {quizResult.score}% accuracy.
                  Earned <span className="font-bold text-indigo-400">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-400">+{quizResult.coinsGained} Coins</span>!
                </p>
                <button
                  onClick={() => { setQuizResult(null); setSelectedAnswers({}); }}
                  className="w-full py-1.5 bg-brand-card border border-brand-border text-brand-text-secondary hover:text-white rounded-lg text-[10px] font-bold transition-all mt-2"
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
