import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Mic, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200/10 dark:border-slate-800/80 flex items-center justify-around px-2 z-40 select-none pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.to || (tab.to !== '/' && currentPath.startsWith(tab.to));

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="relative flex flex-col items-center justify-center w-16 h-full text-slate-400 font-semibold text-[10px] py-1 transition-all"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-600/10 border-t-2 border-indigo-500 z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            
            <div className={`z-10 flex flex-col items-center space-y-1 ${isActive ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
};
