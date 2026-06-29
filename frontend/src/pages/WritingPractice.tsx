import React, { useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { PenTool, Send, Trash, Sparkles, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptOption {
  id: string;
  title: string;
  category: string;
  description: string;
  placeholder: string;
}

const WRITING_PROMPTS: PromptOption[] = [
  {
    id: 'w1',
    title: 'Apologizing for a Delayed Project Report',
    category: 'Office Email',
    description: 'Write an email to your manager Sarah apologizing for a late report. Explain the reason for the delay, explain what you are doing to fix it, and provide a realistic completion date.',
    placeholder: 'Subject: Update on Project Report\n\nHi Sarah,\n\nI am writing to apologize for...'
  },
  {
    id: 'w2',
    title: 'LinkedIn: "SpeakFlow AI" Brand Launch',
    category: 'Social Media Post',
    description: 'Draft a short announcement post (approx 40-70 words) for LinkedIn detailing the launch of SpeakFlow AI. Make it engaging with active call-to-actions.',
    placeholder: 'Exciting news! We are thrilled to announce the official launch of SpeakFlow AI...'
  },
  {
    id: 'w3',
    title: 'Resume Professional career Summary',
    category: 'CV Summary',
    description: 'Write a professional CV summary (3-4 sentences) summarizing your primary strengths, past coding achievements, and career goals.',
    placeholder: 'Highly motivated and results-driven Software Engineer with...'
  }
];

export const WritingPractice: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptOption>(WRITING_PROMPTS[0]);
  const [text, setText] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const submitWriting = useLearningStore(state => state.submitWriting);
  const loading = useLearningStore(state => state.loading);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (wordCount < 10) {
      alert('Please write at least 10 words to enable detailed evaluation.');
      return;
    }

    const evaluation = await submitWriting(selectedPrompt.title, text);
    if (evaluation) {
      setResult(evaluation);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
  };

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Writing Workbench</h2>
        <p className="text-xs text-slate-400">Practice emails, journals, and summary pitches. Get AI suggestions.</p>
      </div>

      {/* 1. HORIZONTAL EXERCISE SELECTOR */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 pl-1">Select Scenario</span>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {WRITING_PROMPTS.map(p => (
            <button
              key={p.id}
              disabled={loading}
              onClick={() => {
                setSelectedPrompt(p);
                setResult(null);
                setText('');
              }}
              className={`snap-center shrink-0 w-60 p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                selectedPrompt.id === p.id
                  ? 'bg-indigo-600/15 border-indigo-500 text-white'
                  : 'glass-card border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {p.category}
              </span>
              <h4 className="font-extrabold text-xs mt-2 text-slate-200 line-clamp-1">{p.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* 2. EXERCISE PROMPT CARD */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 space-y-2">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Assignment Goal</span>
          <span className="text-[10px] font-bold text-indigo-400 uppercase">{selectedPrompt.category}</span>
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-relaxed">
          {selectedPrompt.description}
        </p>
      </div>

      {/* 3. WRITING WORKSPACE */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/10 dark:border-slate-800/80 space-y-3.5">
        <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400">
          <span className="flex items-center space-x-1">
            <PenTool className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Editor</span>
          </span>
          <span className="font-mono text-slate-500">{wordCount} words written</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            disabled={result !== null || loading}
            placeholder={selectedPrompt.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-44 p-3 bg-slate-950/70 border border-slate-900 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans leading-relaxed resize-none"
          />

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.button
                key="submit-btn"
                type="submit"
                disabled={loading || text.trim() === ''}
                className="w-full py-2.5 bg-indigo-600 active:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing grammar & syntax...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for Evaluation (+30 XP)</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.div 
                key="feedback-result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Overview */}
                <div className="flex justify-between items-center bg-slate-950/80 border border-slate-900 p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <BarChart2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Overall Accuracy</span>
                      <p className="text-lg font-black text-indigo-400 mt-0.5">{result.score} / 100</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                    +{result.xpGained} XP • +{result.coinsGained} Coins
                  </span>
                </div>

                {/* Feedback List */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Grammatical Insights</span>
                  {result.feedback.map((f: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs text-slate-300 flex items-start space-x-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Trash className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear and Restart</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};
