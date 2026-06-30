import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/learningStore';
import { Mic, Headset, Briefcase, ArrowRight, MessageSquare } from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';

export const PracticeHub: React.FC = () => {
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  const practices = [
    {
      title: 'AI English Teacher',
      desc: 'Chat, ask questions, define vocabulary, or correct your grammar in simple English.',
      progress: 0,
      label: 'Practice Conversations',
      icon: MessageSquare,
      color: 'from-indigo-600 to-purple-600',
      strokeColor: 'stroke-indigo-500',
      to: '/ai-teacher'
    },
    {
      title: 'Speaking Practice',
      desc: 'Talk aloud in real-world scenarios. Our AI parses and evaluates your pitch.',
      progress: dailyChallenge?.checklist?.speaking?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.speaking?.completed ? 'Completed' : 'Pending Speak',
      icon: Mic,
      color: 'from-orange-500 to-amber-600',
      strokeColor: 'stroke-orange-500',
      to: '/speaking'
    },
    {
      title: 'Listening Dialogue',
      desc: 'Listen to mock customer services, podcasts, and check native speed conversations.',
      progress: dailyChallenge?.checklist?.listening?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.listening?.completed ? 'Completed' : 'Pending Listen',
      icon: Headset,
      color: 'from-emerald-500 to-teal-600',
      strokeColor: 'stroke-emerald-500',
      to: '/listening'
    },
    {
      title: 'Interview Panels',
      desc: 'Test your job answers with strict HR mock boards. Practice present-past-future frameworks.',
      progress: 0,
      label: 'Job Simulation Panel',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-600',
      strokeColor: 'stroke-blue-500',
      to: '/interview'
    }
  ];

  return (
    <div className="space-y-6 pb-6 select-none max-w-lg mx-auto">
      {/* HEADER CARD */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Interactive Practice</h2>
        <p className="text-xs text-brand-text-secondary">Drill pronunciations, accents, and communication scripts with real-time AI advice.</p>
      </div>

      {/* PRACTICE LIST */}
      <div className="space-y-4">
        {practices.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(mod.to)}
              className="bg-brand-card border border-brand-border shadow-level-1 rounded-2xl p-4 border border-brand-border dark:border-brand-border hover:border-indigo-500/30 transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${mod.color} text-white shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-brand-text-primary truncate">{mod.title}</h4>
                  <p className="text-[11px] text-brand-text-secondary line-clamp-1 leading-normal mt-0.5">{mod.desc}</p>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-text-muted mt-1 block">
                    {mod.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                <ProgressRing radius={16} stroke={2.5} progress={mod.progress} color={mod.strokeColor} />
                <ArrowRight className="w-4 h-4 text-brand-text-muted" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
