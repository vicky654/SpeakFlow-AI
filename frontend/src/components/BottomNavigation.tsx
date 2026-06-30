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
    { to: '/speak', label: 'Speak', icon: Mic },
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
    <nav className="fixed bottom-4 left-4 right-4 h-[76px] bg-brand-surface/90 backdrop-blur-xl border border-brand-border/60 rounded-[24px] flex items-center justify-around px-2 z-50 select-none shadow-level-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.to || (tab.to !== '/' && currentPath.startsWith(tab.to));

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            onClick={handleTabClick}
            className="relative flex flex-col items-center justify-center w-14 h-14 text-brand-text-muted transition-all"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-brand-primary/10 rounded-xl border border-brand-primary/10 z-0"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            
            <motion.div 
              className={`z-10 flex flex-col items-center space-y-0.5 ${isActive ? 'text-brand-primary font-semibold' : 'text-brand-text-secondary hover:text-brand-text-primary'} transition-colors duration-200`}
              animate={{ scale: isActive ? 1.05 : 1 }}
              whileTap={{ scale: 0.92 }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[9px] tracking-wide mt-0.5">{tab.label}</span>
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
};
