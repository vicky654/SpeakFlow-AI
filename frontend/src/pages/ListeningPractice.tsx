import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Play, Pause, RotateCcw, Award, HelpCircle, CheckCircle2, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ListeningPractice: React.FC = () => {
  const { lessons, fetchLessons, activeLesson, fetchLessonById, submitQuiz, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetchLessons('listening');
  }, [fetchLessons]);

  const selectScenario = async (id: string) => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setQuizResult(null);
    setSelectedAnswers({});
    setShowTranscript(false);
    await fetchLessonById(id);
  };

  const handlePlaySpeech = () => {
    if (!activeLesson) return;
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();
        const cleanedText = activeLesson.content
          .replace(/\*\*Dialogue Transcript:\*\*/gi, '')
          .replace(/\*/g, '')
          .trim();
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
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
      const practiceTime = result.passed ? 90 : 30;
      await useLearningStore.getState().logPracticeTime('listening', practiceTime);
    }
  };

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Category color map
  const getCategoryColor = (cat: string) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('daily')) return { tag: 'bg-indigo-50 text-indigo-600 border-indigo-200', bar: 'bg-indigo-500' };
    if (c.includes('business')) return { tag: 'bg-blue-50 text-blue-600 border-blue-200', bar: 'bg-blue-500' };
    if (c.includes('travel')) return { tag: 'bg-amber-50 text-amber-600 border-amber-200', bar: 'bg-amber-500' };
    return { tag: 'bg-emerald-50 text-emerald-600 border-emerald-200', bar: 'bg-emerald-500' };
  };

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-6">

      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-brand-text-primary">Listening Lab</h2>
        <p className="text-sm text-brand-text-secondary">Improve transcription retention &amp; decode accents.</p>
      </div>

      {/* 1. DIALOGUES PLAYLIST — vertical list, no horizontal scroll */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted">Dialogues Playlists</span>
        {lessons.length === 0 ? (
          <div className="card flex items-center justify-center py-8 text-brand-text-muted text-sm">
            Loading dialogues…
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map(sc => {
              const colors = getCategoryColor(sc.category);
              const isActive = activeLesson?._id === sc._id;
              return (
                <button
                  key={sc._id}
                  onClick={() => selectScenario(sc._id)}
                  className={`w-full text-left card !p-4 transition-all active:scale-[0.99] flex items-center gap-3 ${
                    isActive ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div className={`w-1 self-stretch rounded-full shrink-0 ${colors.bar}`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.tag}`}>
                      {sc.category}
                    </span>
                    <h4 className="font-semibold text-[13px] text-brand-text-primary leading-snug">{sc.title}</h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-brand-text-muted'}`} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. AUDIO PLAYER + QUIZ */}
      {activeLesson ? (
        <div className="space-y-4">

          {/* AUDIO PLAYER CARD */}
          <div className="card space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <span className="text-[11px] text-brand-text-secondary uppercase font-bold tracking-widest">Now Playing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase">
                {activeLesson.category}
              </span>
            </div>

            <h3 className="font-bold text-[15px] text-brand-text-primary leading-snug">{activeLesson.title}</h3>

            {/* Player controls */}
            <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlaySpeech}
                  style={{ borderRadius: '999px' }}
                  className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={handleStopSpeech}
                  style={{ borderRadius: '999px' }}
                  className="w-8 h-8 bg-brand-card border border-brand-border text-brand-text-secondary flex items-center justify-center active:scale-90 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="space-y-0.5 text-left">
                  <p className="text-[12px] font-bold text-brand-text-primary">
                    {isPlaying ? 'Streaming Audio…' : 'Audio Loaded'}
                  </p>
                  <p className="text-[10px] text-brand-text-muted">0.85x speed · en-US voice</p>
                </div>
              </div>

              {/* Waveform */}
              <div className="flex items-end gap-0.5 h-5 w-12 justify-end">
                {isPlaying ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-indigo-500 rounded"
                      animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                    />
                  ))
                ) : (
                  <div className="flex items-end gap-0.5">
                    {[6, 10, 14, 10, 6].map((h, i) => (
                      <div key={i} className="w-1 bg-gray-300 rounded" style={{ height: h }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transcript accordion */}
            <div className="border-t border-brand-border pt-3">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center justify-between w-full text-xs font-bold text-indigo-500"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {showTranscript ? 'Hide Dialogue Script' : 'Show Dialogue Script'}
                </span>
                <span className="text-[10px] text-brand-text-muted">{showTranscript ? 'Close' : 'Read'}</span>
              </button>
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-text-secondary max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line">
                      {activeLesson.content.replace(/\*\*Dialogue Transcript:\*\*/gi, '').replace(/\*/g, '')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COMPREHENSION QUIZ CARD */}
          <div className="card space-y-5">
            {/* Quiz header */}
            <div className="flex items-center gap-2 border-b border-brand-border pb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-sm text-brand-text-primary">Comprehension Quiz</h3>
            </div>

            {/* Questions */}
            <div className="space-y-5">
              {activeLesson.metadata.questions?.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  {/* Question */}
                  <p className="text-[13px] font-semibold text-brand-text-primary leading-snug">
                    {idx + 1}. {q.question}
                  </p>

                  {/* Answer options — styled as selectable cards */}
                  <div className="space-y-2">
                    {q.options.map((opt: string, i: number) => {
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

            {/* Submit / Result */}
            {!quizResult ? (
              <button
                onClick={handleSubmitQuiz}
                style={{ borderRadius: '12px', padding: '14px' }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Submit Quiz Answers
              </button>
            ) : (
              <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                quizResult.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <div className="flex items-center justify-center gap-2 font-bold text-sm">
                  <Award className="w-4.5 h-4.5" />
                  <span>{quizResult.passed ? 'Quiz Passed! 🎉' : 'Keep Studying! 📚'}</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Accuracy: <span className="font-bold">{quizResult.score}%</span><br />
                  Earned <span className="font-bold text-indigo-600">+{quizResult.xpGained} XP</span> and{' '}
                  <span className="font-bold text-amber-500">+{quizResult.coinsGained} coins</span>!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center text-center py-12 space-y-3">
          <span className="text-4xl">🎧</span>
          <h3 className="text-sm font-bold text-brand-text-primary">Select a Dialogue</h3>
          <p className="text-xs text-brand-text-muted max-w-xs leading-normal">
            Choose an audio dialogue scenario above to start your listening practice session.
          </p>
        </div>
      )}
    </div>
  );
};
