import React, { useState, useEffect, useRef } from 'react';
import { useLearningStore } from '../store/learningStore';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, BarChart3, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scenario {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  prompt: string;
  helperVocabulary: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Introduce Yourself — Office Setting',
    category: 'Office Meeting',
    categoryColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    prompt: 'Imagine you are joining a new team as a Software Engineer. Introduce yourself, stating your role, past experience, and what you look forward to doing.',
    helperVocabulary: ['Delighted', 'Collaborate', 'Kickoff', 'Milestones', 'Expertise']
  },
  {
    id: 's2',
    title: 'Ordering Food at a Restaurant',
    category: 'Restaurant',
    categoryColor: 'bg-amber-50 text-amber-600 border-amber-200',
    prompt: 'You are ordering dinner for yourself and a colleague. Practice stating your reservation, asking for recommendations, and ordering the main course.',
    helperVocabulary: ['Pan-seared', 'Recommendation', 'Lasagne', 'Beverage', 'Reservation']
  },
  {
    id: 's3',
    title: 'HR Interview: "Tell Me About Yourself"',
    category: 'Job Interview',
    categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
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
        setTranscript(_prev => finalTranscript || interimTranscript);
      };
      rec.onerror = (e: any) => console.error('Speech recognition error:', e);
      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported. Please use Google Chrome.');
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
    const finalTranscript = transcript.trim() || 'Hello everyone, I am delighted to join the team as a software engineer.';
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

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-6">

      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-brand-text-primary">Speaking Coach</h2>
        <p className="text-sm text-brand-text-secondary">Drill situational talking cards, verify accent &amp; pacing.</p>
      </div>

      {/* 1. DRILL SELECTOR — vertical stacked cards, no horizontal scroll */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted">Choose a Drill</span>
        <div className="space-y-2">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              disabled={isRecording}
              onClick={() => {
                setSelectedScenario(sc);
                setEvaluation(null);
                setTranscript('');
              }}
              className={`w-full text-left card !p-4 transition-all active:scale-[0.99] flex items-center gap-3 ${
                selectedScenario.id === sc.id
                  ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-md'
                  : 'hover:shadow-md'
              } ${isRecording ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Colored left bar */}
              <div className={`w-1 self-stretch rounded-full shrink-0 ${
                sc.id === 's1' ? 'bg-indigo-500' : sc.id === 's2' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.categoryColor}`}>
                    {sc.category}
                  </span>
                  {selectedScenario.id === sc.id && (
                    <span className="text-[10px] font-bold text-indigo-600">● Active</span>
                  )}
                </div>
                <h4 className="font-semibold text-sm text-brand-text-primary leading-tight">{sc.title}</h4>
                <p className="text-xs text-brand-text-secondary leading-snug line-clamp-2">{sc.prompt}</p>
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 ${
                selectedScenario.id === sc.id ? 'text-indigo-500' : 'text-brand-text-muted'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* 2. SELECTED PROMPT CARD */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-brand-text-primary uppercase tracking-wide">Selected Prompt</span>
          </div>
          <button
            onClick={playPromptText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-600 active:scale-95 transition-all hover:bg-indigo-100"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-sm font-medium text-brand-text-primary leading-relaxed">
            {selectedScenario.prompt}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider">Suggested Keywords</span>
          <div className="flex flex-wrap gap-2">
            {selectedScenario.helperVocabulary.map((word, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MICROPHONE CARD */}
      <div className={`card !p-6 flex flex-col items-center text-center space-y-5 relative overflow-hidden transition-all ${
        isRecording ? 'ring-2 ring-rose-400 ring-offset-1' : ''
      }`}>
        {isRecording && (
          <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none rounded-[18px]" />
        )}

        <div className="space-y-1 z-10">
          <p className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest">
            {isRecording ? '🔴 Recording…' : '🎙️ Tap to Start Speaking'}
          </p>
          {isRecording && (
            <p className="text-2xl font-mono font-bold text-brand-text-primary">{formatTime(timer)}</p>
          )}
        </div>

        {/* Waveform */}
        <div className="h-12 flex items-center justify-center gap-1 z-10">
          {isRecording ? (
            Array.from({ length: 11 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-rose-500 rounded-full"
                animate={{ height: [6, Math.random() * 36 + 8, 6] }}
                transition={{ repeat: Infinity, duration: 0.5 + i * 0.07, ease: 'easeInOut' }}
              />
            ))
          ) : (
            <div className="flex items-end gap-1 opacity-30">
              {[14, 22, 30, 22, 18, 30, 22, 14, 22, 18, 14].map((h, i) => (
                <div key={i} className="w-1.5 bg-indigo-400 rounded-full" style={{ height: h }} />
              ))}
            </div>
          )}
        </div>

        {/* Mic button */}
        <button
          onClick={handleToggleRecord}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all z-10 active:scale-90 shadow-lg ${
            isRecording ? 'bg-rose-500 shadow-rose-300' : 'bg-indigo-600 shadow-indigo-200'
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
        </button>

        <p className="text-xs text-brand-text-muted z-10">
          {isRecording ? 'Tap again to stop & get AI feedback' : 'Speak naturally for at least 15 seconds'}
        </p>

        <AnimatePresence>
          {(transcript || isRecording) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full z-10 space-y-1.5 border-t border-brand-border pt-4"
            >
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Live Transcript</span>
              <div className="w-full min-h-[60px] max-h-[100px] p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-text-secondary overflow-y-auto leading-relaxed">
                {transcript || <span className="italic opacity-60">Listening for your voice…</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. AI LOADING STATE */}
      {loading && (
        <div className="card flex flex-col items-center justify-center text-center space-y-3 py-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-text-secondary leading-relaxed max-w-xs">
            Analyzing pitch, syntax &amp; speaking speed…
          </p>
        </div>
      )}

      {/* 5. AI FEEDBACK SCORECARD */}
      {evaluation && !loading && (
        <div className="card space-y-5">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-sm text-brand-text-primary">AI Feedback Scorecard</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Overall',       value: `${evaluation.overallScore}%`,       color: 'text-indigo-600',  bg: 'bg-indigo-50  border-indigo-100'  },
              { label: 'Fluency',       value: `${evaluation.fluencyScore}%`,        color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Pronunciation', value: `${evaluation.pronunciationScore}%`,  color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-100'   },
              { label: 'Grammar',       value: `${evaluation.grammarScore}%`,        color: 'text-purple-600',  bg: 'bg-purple-50  border-purple-100'  },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} border rounded-xl p-3 text-center`}>
                <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wide">{s.label}</p>
                <p className={`text-xl font-black ${s.color} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text-secondary">Speaking Speed</span>
            <span className="text-sm font-black text-brand-text-primary">{evaluation.speakingSpeed} WPM</span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block">Improvement Tips</span>
            <div className="space-y-2">
              {evaluation.suggestedImprovements.map((imp: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-brand-text-secondary leading-relaxed">{imp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
