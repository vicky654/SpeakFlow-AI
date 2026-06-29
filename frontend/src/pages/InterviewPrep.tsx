import React, { useState, useEffect, useRef } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Mic, MicOff, Star, HelpCircle, BarChart3, AlertCircle, Play, Pause } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const { lessons, fetchLessons, activeLesson, fetchLessonById, evaluateSpeaking, loading } = useLearningStore();
  const user = useAuthStore(state => state.user);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  // Audio Playback states for listening to suggested answers
  const [isPlayingAnswer, setIsPlayingAnswer] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchLessons('interview');
  }, [fetchLessons]);

  // Speech Recognition configuration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => finalTranscript || interimTranscript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const selectQuestion = async (id: string) => {
    window.speechSynthesis.cancel();
    setIsPlayingAnswer(false);
    setEvaluation(null);
    setTranscript('');
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    await fetchLessonById(id);
  };

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      const durationSec = Math.max(5, Math.round((Date.now() - startTimeRef.current) / 1000));
      submitForEvaluation(durationSec);
    } else {
      setTranscript('');
      setEvaluation(null);
      setTimer(0);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      recognitionRef.current.start();
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const submitForEvaluation = async (duration: number) => {
    const finalTranscript = transcript.trim() || (activeLesson?.metadata.suggestedAnswers?.[0] || 'I am looking for my next challenge, and I am excited about this role because your company is leading the path in interactive AI applications.');
    setTranscript(finalTranscript);

    const res = await evaluateSpeaking(`Interview Prep: ${activeLesson?.title}`, finalTranscript, duration);
    if (res) {
      setEvaluation(res);
      await useLearningStore.getState().logPracticeTime('speaking', duration);
    }
  };

  const playSuggestedAnswer = () => {
    if (!activeLesson?.metadata.suggestedAnswers?.[0]) return;
    
    if (isPlayingAnswer) {
      window.speechSynthesis.pause();
      setIsPlayingAnswer(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlayingAnswer(true);
      } else {
        window.speechSynthesis.cancel();
        const text = activeLesson.metadata.suggestedAnswers[0];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;

        utterance.onend = () => setIsPlayingAnswer(false);
        utterance.onerror = () => setIsPlayingAnswer(false);

        window.speechSynthesis.speak(utterance);
        setIsPlayingAnswer(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <Briefcase className="w-8 h-8 text-indigo-400" />
          <span>Interview Prep Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Practice common HR questions, study suggested templates, and try speaking drills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: LIST */}
        <div className="flex flex-col space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Common HR Questions</h3>
          
          <div className="space-y-3">
            {lessons.map(sc => (
              <div
                key={sc._id}
                onClick={() => selectQuestion(sc._id)}
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

        {/* RIGHT COLUMN: COACHING PANEL */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {activeLesson ? (
            <div className="space-y-6">
              
              {/* DETAILS CARD */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Coaching Strategy</span>
                <h2 className="text-xl font-extrabold text-white">{activeLesson.title}</h2>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-800/80 pt-4 font-sans max-h-56 overflow-y-auto pr-1">
                  {activeLesson.content.replace(/#\s+.+/g, '')}
                </div>
              </div>

              {/* TIPS & SUGGESTED ANSWER BOARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interview Tips */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Hiring Manager Tips</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc pl-4 leading-relaxed">
                    {activeLesson.metadata.tips?.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggested template answer */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Suggested Answer</h4>
                    <p className="text-[11px] text-slate-300 italic leading-relaxed line-clamp-4">
                      "{activeLesson.metadata.suggestedAnswers?.[0]}"
                    </p>
                  </div>

                  <button
                    onClick={playSuggestedAnswer}
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all w-full justify-center mt-3"
                  >
                    {isPlayingAnswer ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAnswer ? 'Pause Sample Audio' : 'Listen Sample Audio'}</span>
                  </button>
                </div>
              </div>

              {/* PRACTICE AUDIO DRILL */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
                {isRecording && (
                  <div className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/20 animate-pulse pointer-events-none" />
                )}

                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">Interactive Response Practice</h4>
                  <p className="text-[10px] text-slate-400">Record yourself answering. We will evaluate your pace (WPM), hesitation, and pronunciation confidence.</p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  {isRecording && (
                    <div className="text-xl font-extrabold text-white font-mono">{timer}s</div>
                  )}

                  <button
                    onClick={handleToggleRecord}
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                      isRecording 
                        ? 'bg-rose-600 border-rose-500 hover:bg-rose-500 animate-pulse' 
                        : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  </button>
                </div>

                {transcript && (
                  <div className="w-full text-left space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Recorded Answer Transcript</span>
                    <p className="w-full p-3 bg-slate-950/60 border border-slate-900 rounded-xl text-xs text-slate-300 italic max-h-24 overflow-y-auto leading-relaxed">
                      {transcript}
                    </p>
                  </div>
                )}
              </div>

              {/* REPORT CARD */}
              {loading && (
                <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3 h-48">
                  <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Speech coach is analyzing your answer pacing and fluency...</p>
                </div>
              )}

              {evaluation && !loading && (
                <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 bg-gradient-to-br from-indigo-950/20 to-slate-950/20 text-left">
                  <h3 className="font-extrabold text-slate-200 flex items-center space-x-2 border-b border-slate-850 pb-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Interview Delivery Analytics</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Overall Rating</span>
                      <p className="text-xl font-extrabold text-indigo-400 mt-0.5">{evaluation.overallScore}%</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Fluency</span>
                      <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{evaluation.fluencyScore}%</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Confidence</span>
                      <p className="text-xl font-extrabold text-amber-400 mt-0.5">{evaluation.confidenceScore}%</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-900 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Pacing speed</span>
                      <p className="text-sm font-extrabold text-slate-200 mt-1">{evaluation.speakingSpeed} WPM</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">Coach Feedback:</h4>
                    <div className="space-y-2">
                      {evaluation.suggestedImprovements.map((imp: string, i: number) => (
                        <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start space-x-2 leading-relaxed">
                          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-96 glass-card rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-4xl">💼</span>
              <h3 className="text-lg font-bold text-slate-200">Prep Board</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an interview topic from the list on the left to review study strategies, check templates, and drill your audio delivery.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
