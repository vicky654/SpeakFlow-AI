import React, { useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { PenTool, Send, Trash, RefreshCw, BarChart2, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptOption {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  barColor: string;
  description: string;
  placeholder: string;
}

const WRITING_PROMPTS: PromptOption[] = [
  {
    id: 'w1',
    title: 'Apologizing for a Delayed Project Report',
    category: 'Office Email',
    categoryColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    barColor: 'bg-indigo-500',
    description: 'Write an email to your manager Sarah apologizing for a late report. Explain the reason for the delay, what you are doing to fix it, and provide a realistic completion date.',
    placeholder: 'Subject: Update on Project Report\n\nHi Sarah,\n\nI am writing to apologize for...'
  },
  {
    id: 'w2',
    title: 'LinkedIn: "SpeakFlow AI" Brand Launch',
    category: 'Social Media Post',
    categoryColor: 'bg-blue-50 text-blue-600 border-blue-200',
    barColor: 'bg-blue-500',
    description: 'Draft a short announcement post (approx 40–70 words) for LinkedIn detailing the launch of SpeakFlow AI. Make it engaging with an active call-to-action.',
    placeholder: 'Exciting news! We are thrilled to announce the official launch of SpeakFlow AI...'
  },
  {
    id: 'w3',
    title: 'Resume Professional Career Summary',
    category: 'CV Summary',
    categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    barColor: 'bg-emerald-500',
    description: 'Write a professional CV summary (3–4 sentences) summarising your primary strengths, past coding achievements, and career goals.',
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
    if (evaluation) setResult(evaluation);
  };

  const handleReset = () => {
    setText('');
    setResult(null);
  };

  return (
    <div className="space-y-5 select-none max-w-lg mx-auto pb-10 text-brand-text-primary">

      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-brand-text-primary">Writing Workbench</h2>
        <p className="text-sm text-brand-text-secondary font-normal">
          Practice emails, journals, and summary pitches. Get AI suggestions.
        </p>
      </div>

      {/* 1. SCENARIO SELECTOR — vertical stacked list */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-muted">Select Scenario</span>
        <div className="space-y-2">
          {WRITING_PROMPTS.map(p => (
            <button
              key={p.id}
              disabled={loading}
              onClick={() => {
                setSelectedPrompt(p);
                setResult(null);
                setText('');
              }}
              className={`w-full text-left card !p-4 transition-all active:scale-[0.99] flex items-center gap-3 ${
                selectedPrompt.id === p.id
                  ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-md'
                  : 'hover:shadow-md'
              } ${loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Colored left bar */}
              <div className={`w-1 self-stretch rounded-full shrink-0 ${p.barColor}`} />

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.categoryColor}`}>
                    {p.category}
                  </span>
                  {selectedPrompt.id === p.id && (
                    <span className="text-[10px] font-bold text-indigo-600">● Active</span>
                  )}
                </div>
                <h4 className="font-semibold text-[13px] text-brand-text-primary leading-snug">{p.title}</h4>
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 ${
                selectedPrompt.id === p.id ? 'text-indigo-500' : 'text-brand-text-muted'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* 2. ASSIGNMENT GOAL CARD */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-text-secondary">Assignment Goal</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedPrompt.categoryColor}`}>
            {selectedPrompt.category}
          </span>
        </div>
        <p className="text-[13px] text-brand-text-primary leading-relaxed font-normal">
          {selectedPrompt.description}
        </p>
      </div>

      {/* 3. WRITING EDITOR CARD */}
      <div className="card space-y-4">
        {/* Editor header */}
        <div className="flex justify-between items-center border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-brand-text-primary">Interactive Editor</span>
          </div>
          <span className="text-[11px] font-mono text-brand-text-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
            {wordCount} words
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            disabled={result !== null || loading}
            placeholder={selectedPrompt.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[220px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-sans leading-relaxed resize-none"
          />

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.button
                key="submit-btn"
                type="submit"
                disabled={loading || text.trim() === ''}
                className="w-full min-h-[48px] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing grammar &amp; syntax…</span>
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Score row */}
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                      <BarChart2 className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Overall Score</span>
                      <p className="text-lg font-bold text-indigo-700 leading-tight">{result.score} / 100</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    +{result.xpGained} XP · +{result.coinsGained} coins
                  </span>
                </div>

                {/* Feedback list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider block">Grammatical Insights</span>
                  {result.feedback.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-brand-text-secondary leading-relaxed">{f}</p>
                    </div>
                  ))}
                </div>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full min-h-[44px] py-3 bg-gray-50 border border-gray-200 text-brand-text-secondary hover:bg-gray-100 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash className="w-3.5 h-3.5 text-brand-text-muted" />
                  <span>Clear &amp; Restart</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};
