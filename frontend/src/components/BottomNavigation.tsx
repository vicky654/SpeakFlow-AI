import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Mic, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/learn', label: 'Learn', icon: BookOpen },
    { to: '/practice', label: 'Practice', icon: Mic },
    { to: '/progress', label: 'Progress', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User }
  ];

  const handleTabClick = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (err) {
      // Ignore if not in a native environment
    }
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 h-16 bg-slate-950/85 backdrop-blur-lg border border-slate-900 rounded-3xl flex items-center justify-around px-2 z-40 select-none shadow-2xl shadow-black/60">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.to || (tab.to !== '/' && currentPath.startsWith(tab.to));

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            onClick={handleTabClick}
            className="relative flex flex-col items-center justify-center w-14 h-12 text-slate-400 font-semibold text-[10px] py-1 transition-all"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 z-0"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            
            <div className={`z-10 flex flex-col items-center space-y-0.5 ${isActive ? 'text-indigo-400 font-black scale-105' : 'text-slate-500 hover:text-slate-300'} transition-all duration-200`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-wide mt-0.5">{tab.label}</span>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
};
