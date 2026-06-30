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
    <nav className="fixed bottom-4 left-4 right-4 h-14 bg-brand-card/90 backdrop-blur-lg border border-brand-border rounded-2xl flex items-center justify-around px-2 z-40 select-none shadow-level-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.to || (tab.to !== '/' && currentPath.startsWith(tab.to));

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            onClick={handleTabClick}
            className="relative flex flex-col items-center justify-center w-12 h-10 text-brand-text-muted font-medium text-[9px] transition-all"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-brand-primary/10 rounded-xl border border-brand-primary/15 z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            
            <div className={`z-10 flex flex-col items-center space-y-0.5 ${isActive ? 'text-brand-primary font-medium scale-105' : 'text-brand-text-muted hover:text-brand-text-secondary'} transition-all duration-200`}>
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[8px] tracking-wide mt-0.5">{tab.label}</span>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
};
