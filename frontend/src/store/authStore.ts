import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  toggleTheme: () => void;
  syncUserStats: (xp: number, coins: number, level: number, completedLessonId?: string) => void;
}

const API_URL = 'http://localhost:5000/api';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('speakflow_token'),
  loading: false,
  error: null,
  darkMode: localStorage.getItem('speakflow_dark') !== 'false',

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('speakflow_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('speakflow_token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        get().logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load user');
      set({ user: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('speakflow_token');
    set({ user: null, token: null });
  },

  toggleFavorite: async (wordId) => {
    const { token, user } = get();
    if (!token || !user) return;
    try {
      const res = await fetch(`${API_URL}/auth/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wordId })
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: { ...user, favorites: data.favorites } });
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  },

  toggleTheme: () => {
    const nextMode = !get().darkMode;
    localStorage.setItem('speakflow_dark', String(nextMode));
    set({ darkMode: nextMode });
    
    // Apply class to body HTML element
    const body = document.body;
    if (nextMode) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    }
  },

  syncUserStats: (xp, coins, level, completedLessonId) => {
    const user = get().user;
    if (!user) return;
    
    const completedLessons = [...user.completedLessons];
    if (completedLessonId && !completedLessons.includes(completedLessonId)) {
      completedLessons.push(completedLessonId);
    }

    set({
      user: {
        ...user,
        xp,
        coins,
        level,
        completedLessons
      }
    });
  }
}));
