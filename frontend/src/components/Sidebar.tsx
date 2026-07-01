import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, Mic, User, LogOut, Flame, ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { to: '/', label: 'Home Dashboard', icon: LayoutDashboard },
    { to: '/speak', label: 'Practice Scenarios', icon: Mic },
    { to: '/profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <aside className="w-64 h-full bg-brand-card border-r border-brand-border flex flex-col justify-between py-6 select-none shrink-0 shadow-sm z-30">
      <div className="flex flex-col space-y-8">
        {/* LOGO */}
        <div className="px-6 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <span className="text-base font-black text-white">S</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight text-brand-text-primary font-sans leading-none">SpeakFlow <span className="text-indigo-500">AI</span></h1>
            <span className="text-[8px] text-brand-text-muted uppercase tracking-widest font-black font-mono">Enterprise Edition</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="px-3 flex flex-col space-y-1.5 overflow-y-auto max-h-[60vh] pr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group
                  ${isActive 
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm' 
                    : 'text-brand-text-secondary hover:bg-brand-surface/60 hover:text-brand-text-primary border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* ADMIN LINK */}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={onCloseMobile}
              className={({ isActive }) => `
                flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 mt-4 border
                ${isActive 
                  ? 'bg-rose-600/15 border-rose-500/30 text-rose-500 shadow-md shadow-rose-600/5' 
                  : 'text-rose-400 border-transparent hover:bg-rose-950/20 hover:text-rose-300'}
              `}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* USER STATS & LOGOUT */}
      <div className="px-4 space-y-4">
        {user && (
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col space-y-3.5 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-brand-border flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-brand-text-primary truncate">{user.name}</p>
                <span className="text-[9px] text-brand-text-muted capitalize font-semibold">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-brand-border/60">
              <div className="flex items-center space-x-1.5 hover:text-orange-400 transition-colors">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
                <span className="font-extrabold text-brand-text-secondary">{user.streak} Days</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] border border-indigo-500/20 font-black">
                  Lvl {user.level}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-bold text-brand-text-secondary border border-brand-border/60 hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-500 transition-all duration-200 w-full active:scale-95"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
