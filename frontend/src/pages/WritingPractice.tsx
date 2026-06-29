import React, { useState } from 'react';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { PenTool, Send, Trash, Edit3, Award, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';

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
    description: 'Write an email to your manager apologizing for a late report. State the reason for the delay, explain what you are doing to fix it, and provide a realistic completion date.',
    placeholder: 'Subject: Update on Project Report\n\nHi Sarah,\n\nI am writing to apologize for...'
  },
  {
    id: 'w2',
    title: 'Introducing a Brand Launch Announcement',
    category: 'Social Media Post',
    description: 'Draft a short announcement post (approx 40-70 words) for LinkedIn or Twitter detailing the launch of a new product called "SpeakFlow AI". Make it engaging and include call-to-actions.',
    placeholder: 'Exciting news! We are thrilled to announce the official launch of...'
  },
  {
    id: 'w3',
    title: 'Short Description of My Career Highlights',
    category: 'Resume Summary',
    description: 'Write a professional summary (3-4 sentences) summarizing your primary strengths, roles, and career ambitions for the top section of your CV.',
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
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <PenTool className="w-8 h-8 text-indigo-400" />
          <span>Writing Assistant Lab</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Practice drafting emails, journals, and CV highlights with real-time grammar feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: PROMPTS */}
        <div className="flex flex-col space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Exercise Prompts</h3>
          <div className="space-y-3">
            {WRITING_PROMPTS.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  if (loading) return;
                  setSelectedPrompt(p);
                  setResult(null);
                  setText('');
                }}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedPrompt.id === p.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white'
                    : 'glass-card border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {p.category}
                </span>
                <h4 className="font-bold text-sm mt-2 text-slate-200">{p.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: TEXT AREA AND FEEDBACK */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* PROMPT DETAIL CARD */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Exercise Goal</span>
            <h3 className="font-bold text-slate-200 text-base">{selectedPrompt.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-4 border border-slate-900 rounded-2xl">
              {selectedPrompt.description}
            </p>
          </div>

          {/* EDIT WORKSPACE */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            
            <div className="flex justify-between items-center text-xs font-bold text-slate-400">
              <span>WORK BENCH</span>
              <span className="font-mono">{wordCount} words</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                disabled={result !== null || loading}
                placeholder={selectedPrompt.placeholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 p-4 bg-slate-905 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans leading-relaxed resize-none"
              />

              {!result ? (
                <button
                  type="submit"
                  disabled={loading || text.trim() === ''}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking spelling and grammar...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit for Review (+30 XP)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-6 pt-2">
                  
                  {/* RESULT BAR */}
                  <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-left flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <BarChart2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Overall Score</span>
                        <p className="text-xl font-extrabold text-indigo-400">{result.score} / 100</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                      +{result.xpGained} XP • +{result.coinsGained} Coins
                    </span>
                  </div>

                  {/* FEEDBACK LIST */}
                  <div className="space-y-2.5 text-left">
                    <h4 className="text-xs font-bold text-slate-300">Writing Analysis:</h4>
                    {result.feedback.map((f: string, i: number) => (
                      <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed">
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* RESET BUTTON */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
                  >
                    <Trash className="w-4 h-4 text-slate-400" />
                    <span>Clear and Restart</span>
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
