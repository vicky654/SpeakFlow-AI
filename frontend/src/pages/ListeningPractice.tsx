import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Headset, Play, Pause, RotateCcw, Award, HelpCircle, CheckCircle2, BookOpen } from 'lucide-react';
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

  // Play dialogue script using Browser Speech API
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
        
        // Strip tags/markdown for reading
        const cleanedText = activeLesson.content
          .replace(/\*\*Dialogue Transcript:\*\*/gi, '')
          .replace(/\*/g, '')
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-US';
        utterance.rate = 0.85; // slightly slower for better comprehensibility
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
        };

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
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Listening Lab</h2>
        <p className="text-xs text-brand-text-secondary">Improve transcription retention & decode accents.</p>
      </div>

      {/* 1. SCENARIO SELECTOR CAROUSEL */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Dialogues Playlists</span>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {lessons.map(sc => (
            <button
              key={sc._id}
              onClick={() => selectScenario(sc._id)}
              className={`snap-center shrink-0 w-60 p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                activeLesson?._id === sc._id
                  ? 'bg-indigo-600/15 border-indigo-500 text-white'
                  : 'bg-brand-card border border-brand-border shadow-level-1 border-brand-border text-brand-text-secondary'
              }`}
            >
              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {sc.category}
              </span>
              <h4 className="font-extrabold text-xs mt-2 text-brand-text-primary line-clamp-1">{sc.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* 2. AUDIO PLAYER & QUIZ */}
      {activeLesson ? (
        <div className="space-y-4">
          {/* AUDIO PLAYER BOARD */}
          <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <span className="text-[9px] text-brand-text-secondary uppercase font-black tracking-widest">Now Playing</span>
              <span className="text-[9px] text-indigo-400 font-extrabold uppercase">{activeLesson.category}</span>
            </div>

            <h3 className="font-extrabold text-sm text-brand-text-primary">{activeLesson.title}</h3>

            {/* Simulated Audio Player Dashboard */}
            <div className="w-full bg-brand-surface p-3.5 border border-brand-border rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlaySpeech}
                  className="w-10 h-10 rounded-full bg-indigo-600 active:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md active:scale-90"
                >
                  {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={handleStopSpeech}
                  className="p-2 rounded-full bg-brand-card border border-brand-border text-brand-text-secondary active:scale-90"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <div className="space-y-0.5 text-left min-w-0">
                  <p className="text-[11px] font-bold text-brand-text-primary truncate">{isPlaying ? 'Streaming Audio...' : 'Audio Loaded'}</p>
                  <p className="text-[9px] text-brand-text-muted">0.85x speed • en-US voice</p>
                </div>
              </div>

              {/* Waveform visualizer bars */}
              <div className="flex items-end space-x-1 h-5 w-12 justify-end">
                {isPlaying ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-indigo-500 rounded"
                      animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: 'easeInOut' }}
                    />
                  ))
                ) : (
                  <div className="w-full h-0.5 bg-brand-surface" />
                )}
              </div>
            </div>

            {/* TRANSCRIPT ACCORDION */}
            <div className="border-t border-brand-border pt-3">
              <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center justify-between w-full text-xs font-bold text-indigo-400 active:text-indigo-300"
              >
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{showTranscript ? 'Hide Dialogue Script' : 'Show Dialogue Script'}</span>
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
                    <div className="p-3 bg-brand-bg/60 border border-brand-border rounded-xl text-xs text-brand-text-secondary max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line italic">
                      {activeLesson.content.replace(/\*\*Dialogue Transcript:\*\*/gi, '').replace(/\*/g, '')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COMPREHENSION QUIZ BOARD */}
          <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border space-y-4">
            <h3 className="font-extrabold text-sm text-brand-text-primary flex items-center space-x-2 border-b border-brand-border pb-2.5">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-400" />
              <span>Comprehension Quiz</span>
            </h3>

            <div className="space-y-4">
              {activeLesson.metadata.questions?.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-xs font-bold text-brand-text-secondary">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, i) => {
                      const isSelected = selectedAnswers[q.id] === opt;
                      const isCorrect = q.answer === opt;
                      let btnClass = 'bg-brand-surface/40 border-brand-border text-brand-text-secondary active:scale-[0.99]';

                      if (isSelected) {
                        btnClass = 'bg-indigo-600 border-indigo-500 text-white shadow-md font-bold';
                      }

                      if (quizResult) {
                        if (isCorrect) {
                          btnClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-extrabold';
                        } else if (isSelected) {
                          btnClass = 'bg-rose-500/15 border-rose-500 text-rose-400 font-bold line-through';
                        } else {
                          btnClass = 'bg-brand-bg/20 border-brand-border/60 text-brand-text-muted opacity-50';
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={quizResult !== null}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`p-3 text-left text-xs rounded-xl border transition-all leading-relaxed ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT OR RESULT */}
            {!quizResult ? (
              <button
                onClick={handleSubmitQuiz}
                className="w-full py-2.5 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 mt-2"
              >
                Submit Quiz Answers
              </button>
            ) : (
              <div className={`p-4 rounded-xl border text-center space-y-2 ${
                quizResult.passed 
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
              }`}>
                <div className="flex items-center justify-center space-x-1.5 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>{quizResult.passed ? 'Quiz Passed! 🎉' : 'Keep Studying! 📚'}</span>
                </div>
                <p className="text-[10px] leading-normal">
                  Accuracy rate: <span className="font-extrabold">{quizResult.score}%</span>.<br />
                  Earned <span className="font-bold text-indigo-400">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-400">+{quizResult.coinsGained} Coins</span>!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-64 bg-brand-card border border-brand-border shadow-level-1 rounded-3xl border border-brand-border flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-3xl">🎧</span>
          <h3 className="text-sm font-bold text-brand-text-primary">Select Scenario</h3>
          <p className="text-[10px] text-brand-text-muted max-w-xs leading-normal">
            Choose an audio dialogue scenario from the horizontal cards list above to start your listening practice.
          </p>
        </div>
      )}
    </div>
  );
};
