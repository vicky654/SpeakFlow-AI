import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/learningStore';
import { BookOpen, Gamepad2, Award, BookOpenCheck, PenTool, ArrowRight } from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';

export const LearnHub: React.FC = () => {
  const { dailyChallenge, fetchDailyChallenge } = useLearningStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyChallenge();
  }, [fetchDailyChallenge]);

  const modules = [
    {
      title: 'Vocabulary Booster',
      desc: 'Master 10 high-frequency words daily with memory triggers & phonetic guides.',
      progress: dailyChallenge?.checklist?.vocab?.completed ? 100 : Math.round(((dailyChallenge?.checklist?.vocab?.current || 0) / 10) * 100),
      label: `${dailyChallenge?.checklist?.vocab?.current || 0}/10 words`,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      strokeColor: 'stroke-blue-500',
      to: '/vocab'
    },
    {
      title: 'Vocabulary Game',
      desc: 'Test your retention with speed-matching and memory recall drills.',
      progress: dailyChallenge?.checklist?.vocab?.completed ? 100 : Math.round(((dailyChallenge?.checklist?.vocab?.current || 0) / 10) * 100),
      label: 'Play & Speed Run',
      icon: Gamepad2,
      color: 'from-emerald-500 to-teal-600',
      strokeColor: 'stroke-emerald-500',
      to: '/game'
    },
    {
      title: 'Grammar Coach',
      desc: 'Learn complex grammatical structures and pass chapter quizzes.',
      progress: dailyChallenge?.checklist?.quiz?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.quiz?.completed ? 'Completed' : 'Pending Quiz',
      icon: Award,
      color: 'from-orange-500 to-amber-600',
      strokeColor: 'stroke-orange-500',
      to: '/grammar'
    },
    {
      title: 'Reading Comprehension',
      desc: 'Read curated mock dialogues and business briefs.',
      progress: dailyChallenge?.checklist?.reading?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.reading?.completed ? 'Completed' : 'Pending Reading',
      icon: BookOpenCheck,
      color: 'from-purple-500 to-pink-600',
      strokeColor: 'stroke-purple-500',
      to: '/reading'
    },
    {
      title: 'Writing Simulator',
      desc: 'Draft letters and workplace emails. Get live grammatical corrections.',
      progress: dailyChallenge?.checklist?.writing?.completed ? 100 : 0,
      label: dailyChallenge?.checklist?.writing?.completed ? 'Completed' : 'Pending Brief',
      icon: PenTool,
      color: 'from-rose-500 to-red-600',
      strokeColor: 'stroke-rose-500',
      to: '/writing'
    }
  ];

  return (
    <div className="space-y-6 pb-6 select-none max-w-lg mx-auto">
      {/* HEADER CARD */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-white">Curriculum Syllabus</h2>
        <p className="text-xs text-slate-400">Complete modules daily to grow your streak and secure badge levels.</p>
      </div>

      {/* MODULE STACK */}
      <div className="space-y-4">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(mod.to)}
              className="glass-card rounded-2xl p-4 border border-slate-200/10 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${mod.color} text-white shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{mod.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal mt-0.5">{mod.desc}</p>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mt-1 block">
                    {mod.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                <ProgressRing radius={16} stroke={2.5} progress={mod.progress} color={mod.strokeColor} />
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
