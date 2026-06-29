import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, BookOpen, Gamepad2, Mic, Headset, 
  BookOpenCheck, PenTool, Award, Briefcase, User, 
  Settings, LogOut, Flame, ShieldAlert
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
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vocab', label: 'Vocabulary', icon: BookOpen },
    { to: '/game', label: 'Vocab Game', icon: Gamepad2 },
    { to: '/speaking', label: 'Speaking', icon: Mic },
    { to: '/listening', label: 'Listening', icon: Headset },
    { to: '/reading', label: 'Reading', icon: BookOpenCheck },
    { to: '/writing', label: 'Writing', icon: PenTool },
    { to: '/grammar', label: 'Grammar Course', icon: Award },
    { to: '/interview', label: 'Interview Prep', icon: Briefcase },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between py-6 select-none shrink-0">
      <div className="flex flex-col space-y-7">
        {/* LOGO */}
        <div className="px-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white font-sans">SpeakFlow <span className="text-indigo-400">AI</span></h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">MVP Edition</span>
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
                  flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}
                `}
              >
                <Icon className="w-4 h-4" />
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
                flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mt-4 border border-rose-500/10
                ${isActive 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/10' 
                  : 'text-rose-400 hover:bg-rose-950/20 hover:text-rose-300'}
              `}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* USER STATS & LOGOUT */}
      <div className="px-4 space-y-4">
        {user && (
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <span className="text-[10px] text-slate-500 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-900">
              <div className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
                <span className="font-bold text-slate-300">{user.streak} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono text-[10px] border border-indigo-800/30 font-bold">
                  Lvl {user.level}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-950/15 hover:text-rose-400 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
