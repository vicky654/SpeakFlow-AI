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
    <div className="space-y-6 select-none max-w-lg mx-auto pb-10 pt-4 px-3 text-brand-text-primary font-sans">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-brand-text-primary">Writing Workbench</h2>
        <p className="text-xs text-brand-text-secondary font-normal">Practice emails, journals, and summary pitches. Get AI suggestions.</p>
      </div>

      {/* 1. HORIZONTAL EXERCISE SELECTOR */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-medium tracking-wider text-brand-text-muted pl-1">Select Scenario</span>
        <div className="flex space-x-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory -mx-3 px-3">
          {WRITING_PROMPTS.map(p => (
            <button
              key={p.id}
              disabled={loading}
              onClick={() => {
                setSelectedPrompt(p);
                setResult(null);
                setText('');
              }}
              className={`snap-center shrink-0 w-60 p-4.5 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between ${
                selectedPrompt.id === p.id
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                  : 'bg-brand-card border-brand-border text-brand-text-secondary hover:border-brand-primary/30'
              }`}
            >
              <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/15 self-start">
                {p.category}
              </span>
              <h4 className="font-semibold text-xs mt-3 text-brand-text-primary leading-tight">{p.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* 2. EXERCISE PROMPT CARD */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-5 space-y-2">
        <div className="flex justify-between items-center border-b border-brand-border pb-2.5">
          <span className="text-[10px] uppercase font-semibold tracking-widest text-brand-text-secondary">Assignment Goal</span>
          <span className="text-[10px] font-semibold text-brand-primary uppercase">{selectedPrompt.category}</span>
        </div>
        <p className="text-xs font-normal text-brand-text-primary leading-relaxed">
          {selectedPrompt.description}
        </p>
      </div>

      {/* 3. WRITING WORKSPACE */}
      <div className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center text-[10px] font-medium text-brand-text-secondary">
          <span className="flex items-center space-x-1.5">
            <PenTool className="w-4 h-4 text-brand-primary" />
            <span>Interactive Editor</span>
          </span>
          <span className="font-mono text-brand-text-muted">{wordCount} words written</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            disabled={result !== null || loading}
            placeholder={selectedPrompt.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[240px] h-60 p-4 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/20 transition-all font-sans leading-relaxed resize-none"
          />

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.button
                key="submit-btn"
                type="submit"
                disabled={loading || text.trim() === ''}
                className="w-full min-h-[44px] py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    <span>Analyzing grammar & syntax...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4.5 h-4.5" />
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
                <div className="flex justify-between items-center bg-brand-surface border border-brand-border p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary">
                      <BarChart2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-brand-text-muted uppercase font-semibold tracking-wider">Overall Accuracy</span>
                      <p className="text-base font-semibold text-brand-primary mt-0.5">{result.score} / 100</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-brand-success font-semibold bg-brand-success/10 border border-brand-success/15 px-3 py-1.5 rounded-full shrink-0">
                    +{result.xpGained} XP • +{result.coinsGained} Coins
                  </span>
                </div>

                {/* Feedback List */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-semibold text-brand-text-secondary uppercase tracking-wider block">Grammatical Insights</span>
                  {result.feedback.map((f: string, i: number) => (
                    <div key={i} className="p-3.5 bg-brand-surface border border-brand-border rounded-xl text-xs text-brand-text-secondary flex items-start space-x-2 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full min-h-[44px] py-3.5 bg-brand-surface border border-brand-border text-brand-text-secondary hover:bg-brand-bg rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Trash className="w-3.5 h-3.5 text-brand-text-muted" />
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
