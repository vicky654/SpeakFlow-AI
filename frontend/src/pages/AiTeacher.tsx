import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Send, Volume2, Sparkles, MessageCircle, ArrowLeft, Bot, User } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  difficultWords?: string[];
}

export const AiTeacher: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const loadUser = useAuthStore(state => state.loadUser);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI English Teacher. I can help you learn English step by step.\n\nYou can type any sentence, or try clicking one of the common questions below to start! 😊'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "Teach today's lesson 📚", text: "Teach me today's lesson" },
    { label: "Define 'Hello' 📖", text: "What does Hello mean?" },
    { label: "Correct a sentence ✍️", text: "Correct my sentence: I go office yesterday" },
    { label: "How to pronounce 🔊", text: "How do I pronounce Congratulations?" },
    { label: "Simple chat 💬", text: "Talk to me in simple English" }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      // Map frontend messages role name to backend category/messages
      const res = await fetch(`${API_BASE_URL}/learning/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: 'teacher',
          messages: updatedMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      });

      if (!res.ok) throw new Error('Teacher is offline.');
      const data = await res.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        suggestions: data.suggestions,
        difficultWords: data.difficultWords
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Sync user profile points
      if (loadUser) {
        await loadUser();
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting right now. Please verify your connection or ask again in a moment! 🌐'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakText = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
      if (isPlaying === index) {
        window.speechSynthesis.cancel();
        setIsPlaying(null);
      } else {
        window.speechSynthesis.cancel();
        // Clean markdown indicators for natural TTS speech
        const cleanText = text.replace(/\*\*|\*|👉|❌|✅|💡|🇮🇳/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // slightly slower for beginners
        utterance.onend = () => setIsPlaying(null);
        utterance.onerror = () => setIsPlaying(null);
        
        setIsPlaying(index);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Audio playback is not supported in this browser.');
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-lg mx-auto pb-6 select-none">
      
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900 bg-slate-950/20 px-1 shrink-0">
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Practice Hub</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">AI Teacher Mode</span>
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4 min-h-0 scrollbar-none">
        {messages.map((msg, idx) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-indigo-650 border border-indigo-500/30 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-600/10">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div className="flex flex-col space-y-1.5 max-w-[80%] text-left">
                {/* Bubble card */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line relative group border ${
                    isAI
                      ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                      : 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                  }`}
                >
                  {msg.content}

                  {/* Speaker Pronounce icon on AI message */}
                  {isAI && (
                    <button
                      onClick={() => handleSpeakText(msg.content, idx)}
                      className={`absolute -right-3 top-3 p-1.5 rounded-full border transition-all active:scale-90 shadow-sm ${
                        isPlaying === idx
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                          : 'bg-slate-950/90 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions and highlights */}
                {isAI && (msg.suggestions?.length || 0) > 0 && (
                  <div className="space-y-1 pl-1">
                    {msg.suggestions?.map((sug, i) => (
                      <span key={i} className="text-[10px] text-amber-400 block font-medium">
                        💡 Suggestion: {sug}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-650 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested beginner questions block (only shown when not loading) */}
      {!loading && messages.length <= 4 && (
        <div className="py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0 select-none pb-3">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p.text)}
              className="inline-block px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-[10px] font-bold text-slate-350 hover:border-indigo-500 hover:text-white transition-all active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Message input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me a question or type English here..."
          className="flex-1 min-w-0 bg-transparent py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 rounded-xl bg-indigo-650 active:bg-indigo-600 disabled:opacity-20 text-white shrink-0 active:scale-95 transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
