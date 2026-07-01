import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sparkles, User, Mail, Lock, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'job_seeker' | 'professional'>('student');

  const register = useAuthStore(state => state.register);
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const error = useAuthStore(state => state.error);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    const success = await register(name, email, password, role);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg px-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-brand-card border border-brand-border shadow-level-1 rounded-3xl p-8 relative z-10 flex flex-col space-y-5">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-brand-text-primary mt-3">Start Your Journey</h2>
          <p className="text-sm text-brand-text-secondary">Join SpeakFlow AI and master English today.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3.5">
          {/* Full Name input */}
          <div className="space-y-1">
            <label className="text-xs text-brand-text-secondary font-semibold pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input
                type="text"
                required
                placeholder="Alex Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-card border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs text-brand-text-secondary font-semibold pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-card border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs text-brand-text-secondary font-semibold pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-card border border-brand-border rounded-xl text-sm text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1">
            <label className="text-xs text-brand-text-secondary font-semibold pl-1">I am a...</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full pl-11 pr-4 py-2.5 bg-brand-card border border-brand-border rounded-xl text-sm text-brand-text-primary focus:outline-none focus:border-indigo-500/60 transition-all appearance-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="job_seeker">Job Seeker</option>
                <option value="professional">Working Professional</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-secondary">
                ▾
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ borderRadius: '999px', padding: '12px 24px' }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 active:scale-[0.98]"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>


        <div className="text-center text-xs text-brand-text-secondary pt-1">
          <span>Already have an account? </span>
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
