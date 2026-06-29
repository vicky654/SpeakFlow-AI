import React, { useEffect, useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Headset, Play, Pause, RotateCcw, CheckCircle, Award, Sparkles, HelpCircle } from 'lucide-react';

export const ListeningPractice: React.FC = () => {
  const { lessons, fetchLessons, activeLesson, fetchLessonById, submitQuiz, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);

  useEffect(() => {
    fetchLessons('listening');
  }, [fetchLessons]);

  const selectScenario = async (id: string) => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setQuizResult(null);
    setSelectedAnswers({});
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
    
    // Check completeness
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const result = await submitQuiz(activeLesson._id, selectedAnswers);
    if (result) {
      setQuizResult(result);
      
      // Log active learning time (e.g. 90 seconds for passing, 30 for failing)
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
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <Headset className="w-8 h-8 text-indigo-400" />
          <span>Listening Practice Hub</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Listen to standard English dialogues, pick up key accents, and test your retention.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: LIST */}
        <div className="flex flex-col space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Audio Dialogues</h3>
          
          <div className="space-y-3">
            {lessons.map(sc => (
              <div
                key={sc._id}
                onClick={() => selectScenario(sc._id)}
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

        {/* RIGHT COLUMN: DETAIL PLAYER & QUIZ */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {activeLesson ? (
            <div className="space-y-6">
              
              {/* AUDIO PLAYER BOARD */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Listening Room</span>
                  <span className="text-xs text-indigo-400 font-bold">{activeLesson.category}</span>
                </div>

                <h2 className="text-xl font-extrabold text-white">{activeLesson.title}</h2>

                {/* Simulated Audio Player Visualizer */}
                <div className="w-full bg-slate-950 p-4 border border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlaySpeech}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isPlaying 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={handleStopSpeech}
                      className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-slate-200">{isPlaying ? 'Playing Dialogue' : 'Audio Ready'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">1.0x Speed • En-US Voice</p>
                    </div>
                  </div>

                  {/* Visualizer bars */}
                  {isPlaying && (
                    <div className="flex items-end space-x-1 h-6">
                      <div className="w-0.5 bg-indigo-500 h-2 animate-pulse" />
                      <div className="w-0.5 bg-indigo-500 h-5 animate-pulse delay-75" />
                      <div className="w-0.5 bg-indigo-500 h-3 animate-pulse delay-100" />
                      <div className="w-0.5 bg-indigo-500 h-6 animate-pulse delay-150" />
                      <div className="w-0.5 bg-indigo-500 h-4 animate-pulse delay-200" />
                    </div>
                  )}
                </div>
              </div>

              {/* COMPREHENSION QUIZ BOARD */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
                <h3 className="font-extrabold text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>Comprehension Quiz</span>
                </h3>

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

                          // If quiz completed, show color codes
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

                {/* SUBMIT BUTTON or RESULT METRIC */}
                {!quizResult ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 mt-4"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                    quizResult.passed 
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                  }`}>
                    <div className="flex items-center justify-center space-x-2 font-bold text-base">
                      <Award className="w-5 h-5" />
                      <span>{quizResult.passed ? 'Quiz Passed! 🎉' : 'Keep Practicing! 📚'}</span>
                    </div>
                    <p className="text-xs">
                      You scored <span className="font-extrabold">{quizResult.score}%</span> accuracy rate.
                      Earned <span className="font-bold text-indigo-400">+{quizResult.xpGained} XP</span> and <span className="font-bold text-amber-400">+{quizResult.coinsGained} Coins</span>!
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-96 glass-card rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-4xl">🎧</span>
              <h3 className="text-lg font-bold text-slate-200">Listening Panel</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an audio scenario from the list on the left to begin practicing your comprehension and listening retention.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
