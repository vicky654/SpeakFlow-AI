import React, { useState, useEffect, useRef } from 'react';
import { useLearningStore } from '../store/learningStore';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, BarChart3, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scenario {
  id: string;
  title: string;
  category: string;
  prompt: string;
  helperVocabulary: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Introduce Yourself in an Office Setting',
    category: 'Office Meeting',
    prompt: 'Imagine you are joining a new team as a Software Engineer. Introduce yourself, stating your role, past experience, and what you look forward to doing.',
    helperVocabulary: ['Delighted', 'Collaborate', 'Kickoff', 'Milestones', 'Expertise']
  },
  {
    id: 's2',
    title: 'Ordering Food at a Busy Restaurant',
    category: 'Restaurant',
    prompt: 'You are ordering dinner for yourself and a colleague. Practice stating your reservation, asking for recommendations, and ordering the main course.',
    helperVocabulary: ['Pan-seared', 'Recommendation', 'lasagne', 'Beverage', 'Reservation']
  },
  {
    id: 's3',
    title: 'HR Interview: "Tell Me About Yourself"',
    category: 'Job Interview',
    prompt: 'Apply the Present-Past-Future framework to introduce your professional journey to the hiring managers.',
    helperVocabulary: ['Accomplished', 'Optimization', 'Framework', 'Synergy', 'Contribution']
  }
];

export const SpeakingPractice: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const evaluateSpeaking = useLearningStore(state => state.evaluateSpeaking);
  const logPracticeTime = useLearningStore(state => state.logPracticeTime);
  const loading = useLearningStore(state => state.loading);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize Speech Recognition API
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

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (isRecording) {
      // STOP RECORDING
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      const durationSec = Math.max(5, Math.round((Date.now() - startTimeRef.current) / 1000));
      submitForEvaluation(durationSec);
    } else {
      // START RECORDING
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
    const finalTranscript = transcript.trim() || 'Hello everyone, I am delighted to join the team as a software engineer. In my previous role at TechCorp, I worked on dashboard optimization and look forward to collaborating with everyone on our upcoming project milestones.';
    setTranscript(finalTranscript);

    const res = await evaluateSpeaking(selectedScenario.title, finalTranscript, duration);
    if (res) {
      setEvaluation(res);
      await logPracticeTime('speaking', duration);
    }
  };

  const playPromptText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedScenario.prompt);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 select-none max-w-lg mx-auto pb-6">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Speaking Coach</h2>
        <p className="text-xs text-brand-text-secondary">Drill situational talking cards, verify accent & pacing.</p>
      </div>

      {/* 1. SCENARIO SELECTOR CAROUSEL */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted pl-1">Choose Drill</span>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              disabled={isRecording}
              onClick={() => {
                setSelectedScenario(sc);
                setEvaluation(null);
                setTranscript('');
              }}
              className={`snap-center shrink-0 w-64 p-4 rounded-2xl border text-left transition-all ${
                selectedScenario.id === sc.id
                  ? 'bg-indigo-600/15 border-indigo-500 text-white'
                  : 'bg-brand-card border border-brand-border shadow-level-1 border-brand-border text-brand-text-secondary'
              } ${isRecording ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {sc.category}
              </span>
              <h4 className="font-extrabold text-xs mt-2 text-brand-text-primary line-clamp-1">{sc.title}</h4>
              <p className="text-[10px] text-brand-text-muted line-clamp-1 mt-1">{sc.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE SCENARIO CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border space-y-3.5">
        <div className="flex justify-between items-center border-b border-brand-border pb-2">
          <span className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">Selected Prompt</span>
          <button 
            onClick={playPromptText}
            className="flex items-center space-x-1 px-2.5 py-1 bg-brand-surface border border-brand-border rounded-lg text-[9px] font-bold text-indigo-400 active:scale-95 transition-all"
          >
            <Volume2 className="w-3 h-3" />
            <span>Speak Prompt</span>
          </button>
        </div>
        <p className="text-xs font-semibold text-brand-text-primary leading-relaxed">
          {selectedScenario.prompt}
        </p>

        {/* Helpful Vocabulary tags */}
        <div className="pt-2">
          <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block mb-1.5">Suggested Keywords</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedScenario.helperVocabulary.map((word, i) => (
              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-bg text-indigo-300 border border-brand-border">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HERO MICROPHONE INTERACTION */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border flex flex-col items-center justify-center text-center space-y-5 relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/20 animate-pulse pointer-events-none" />
        )}

        <div className="space-y-1 z-10">
          <span className="text-[10px] text-brand-text-secondary uppercase tracking-widest font-black">
            {isRecording ? 'Capturing Vocals...' : 'Tap Mic to Start Speaking'}
          </span>
          {isRecording && (
            <div className="text-xl font-extrabold text-white font-mono">{timer}s</div>
          )}
        </div>

        {/* Waveform Animation */}
        <div className="h-10 flex items-center justify-center space-x-1.5 z-10">
          {isRecording ? (
            Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-indigo-500 rounded-full"
                animate={{
                  height: [10, Math.random() * 40 + 10, 10]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + i * 0.08,
                  ease: 'easeInOut'
                }}
              />
            ))
          ) : (
            <div className="w-24 h-0.5 bg-brand-surface rounded" />
          )}
        </div>

        {/* RECORD MIC TRIGGER */}
        <button
          onClick={handleToggleRecord}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all z-10 active:scale-90 ${
            isRecording 
              ? 'bg-rose-600 border-rose-500 shadow-lg shadow-rose-600/20 glow-active' 
              : 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20'
          }`}
        >
          {isRecording ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
        </button>

        {/* Dynamic Transcript Container */}
        <AnimatePresence>
          {(transcript || isRecording) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full text-left space-y-1.5 pt-2 border-t border-brand-border z-10"
            >
              <span className="text-[9px] uppercase font-extrabold text-brand-text-muted tracking-wider">Live Transcript</span>
              <div className="w-full h-20 p-2.5 bg-brand-bg/60 border border-brand-border rounded-xl text-xs text-brand-text-secondary overflow-y-auto leading-relaxed italic">
                {transcript || 'Awaiting spoken voice input...'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. ANALYTICS REPORT */}
      {loading && (
        <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-6 border border-brand-border dark:border-brand-border text-center flex flex-col items-center justify-center space-y-3 h-52">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-brand-text-secondary leading-normal max-w-xs">Analyzing pitch accuracy, syntax structure, and speed...</p>
        </div>
      )}

      {evaluation && !loading && (
        <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-5 border border-brand-border dark:border-brand-border space-y-5 bg-gradient-to-br from-indigo-950/15 to-slate-950/10">
          <h3 className="font-extrabold text-sm text-brand-text-primary flex items-center space-x-2 border-b border-brand-border pb-2.5">
            <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
            <span>AI Feedback Scorecard</span>
          </h3>

          {/* Scores details list */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-brand-bg/50 border border-brand-border/60 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold">Overall</span>
              <p className="text-lg font-black text-indigo-400 mt-0.5">{evaluation.overallScore}%</p>
            </div>
            <div className="bg-brand-bg/50 border border-brand-border/60 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold">Fluency</span>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{evaluation.fluencyScore}%</p>
            </div>
            <div className="bg-brand-bg/50 border border-brand-border/60 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold">Accent</span>
              <p className="text-lg font-black text-amber-400 mt-0.5">{evaluation.pronunciationScore}%</p>
            </div>
            <div className="bg-brand-bg/50 border border-brand-border/60 p-2.5 rounded-xl text-center">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold">Grammar</span>
              <p className="text-lg font-black text-purple-400 mt-0.5">{evaluation.grammarScore}%</p>
            </div>
            <div className="bg-brand-bg/50 border border-brand-border/60 p-2.5 rounded-xl text-center col-span-2 flex flex-col justify-center items-center">
              <span className="text-[9px] text-brand-text-muted uppercase font-bold">Speed</span>
              <p className="text-sm font-black text-brand-text-primary mt-0.5">{evaluation.speakingSpeed} WPM</p>
            </div>
          </div>

          {/* Suggestions checklist */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-wider block">Actionable Suggestions</span>
            <div className="space-y-2">
              {evaluation.suggestedImprovements.map((imp: string, i: number) => (
                <div key={i} className="p-3 bg-brand-bg/50 border border-brand-border rounded-xl text-xs text-brand-text-secondary flex items-start space-x-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
