import { create } from 'zustand';
import { Word, Lesson, LeaderboardEntry, Badge } from '../types';
import { useAuthStore } from './authStore';
import API_BASE_URL from '../config/api';

interface LearningState {
  dailyWords: Word[];
  allWords: Word[];
  lessons: Lesson[];
  activeLesson: Lesson | null;
  dailyChallenge: any | null;
  leaderboard: LeaderboardEntry[];
  badges: Badge[];
  loading: boolean;
  error: string | null;
  
  fetchDailyWords: () => Promise<void>;
  refreshDailyWords: () => Promise<void>;
  fetchAllWords: () => Promise<void>;
  learnWord: (wordId: string) => Promise<void>;
  fetchLessons: (type: 'grammar' | 'reading' | 'listening' | 'interview') => Promise<void>;
  fetchLessonById: (id: string) => Promise<void>;
  submitQuiz: (lessonId: string, answers: Record<string, string>) => Promise<{ score: number; passed: boolean; results: any[] } | null>;
  logPracticeTime: (skill: 'speaking' | 'listening' | 'reading', duration: number) => Promise<void>;
  submitWriting: (prompt: string, submission: string) => Promise<{ score: number; feedback: string[] } | null>;
  evaluateSpeaking: (scenarioTitle: string, transcript: string, duration: number) => Promise<any | null>;
  fetchDailyChallenge: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchBadges: () => Promise<void>;
  
  // Admin Methods
  adminAddVocab: (vocabData: Partial<Word>) => Promise<boolean>;
  adminDeleteVocab: (id: string) => Promise<boolean>;
  adminAddLesson: (lessonData: Partial<Lesson>) => Promise<boolean>;
  adminDeleteLesson: (id: string) => Promise<boolean>;
  fetchAdminStats: () => Promise<any>;
}



export const useLearningStore = create<LearningState>((set, get) => ({
  dailyWords: [],
  allWords: [],
  lessons: [],
  activeLesson: null,
  dailyChallenge: null,
  leaderboard: [],
  badges: [],
  loading: false,
  error: null,

  fetchDailyWords: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/vocab/daily`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch daily vocabulary');
      set({ dailyWords: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  refreshDailyWords: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/vocab/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to refresh vocabulary');
      set({ dailyWords: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAllWords: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/vocab`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch vocabulary');
      set({ allWords: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  learnWord: async (wordId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vocab/learned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wordId })
      });
      const data = await res.json();
      if (res.ok) {
        // Sync user overall stats
        await useAuthStore.getState().loadUser();
        // Refresh daily challenge details
        get().fetchDailyChallenge();
      }
    } catch (err) {
      console.error('Failed to mark word as learned', err);
    }
  },

  fetchLessons: async (type) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null, lessons: [] });
    try {
      const res = await fetch(`${API_BASE_URL}/learning/lessons?type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch lessons');
      set({ lessons: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchLessonById: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ loading: true, error: null, activeLesson: null });
    try {
      const res = await fetch(`${API_BASE_URL}/learning/lessons/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch lesson details');
      set({ activeLesson: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  submitQuiz: async (lessonId, answers) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/learning/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit quiz');
      
      // Update global user details
      await useAuthStore.getState().loadUser();
      get().fetchDailyChallenge();
      set({ loading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  logPracticeTime: async (skill, duration) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/learning/practice/time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill, duration })
      });
      if (res.ok) {
        await useAuthStore.getState().loadUser();
        get().fetchDailyChallenge();
      }
    } catch (err) {
      console.error('Failed to log practice time', err);
    }
  },

  submitWriting: async (prompt, submission) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/learning/practice/writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, submission })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit writing');
      
      await useAuthStore.getState().loadUser();
      get().fetchDailyChallenge();
      set({ loading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  evaluateSpeaking: async (scenarioTitle, transcript, duration) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    set({ loading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/learning/practice/speaking/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scenarioTitle, transcript, duration })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to evaluate speech');
      
      await useAuthStore.getState().loadUser();
      get().fetchDailyChallenge();
      set({ loading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  fetchDailyChallenge: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gamification/daily-challenge`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        set({ dailyChallenge: data });
      }
    } catch (err) {
      console.error('Failed to fetch daily challenge', err);
    }
  },

  fetchLeaderboard: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gamification/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        set({ leaderboard: data });
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
  },

  fetchBadges: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/gamification/badges-list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        set({ badges: data });
      }
    } catch (err) {
      console.error('Failed to fetch badges', err);
    }
  },

  // ADMIN OPERATIONS
  adminAddVocab: async (vocabData) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vocab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vocabData)
      });
      return res.ok;
    } catch (err) {
      console.error('Admin add vocab error', err);
      return false;
    }
  },

  adminDeleteVocab: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vocab/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch (err) {
      console.error('Admin delete vocab error', err);
      return false;
    }
  },

  adminAddLesson: async (lessonData) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lessonData)
      });
      return res.ok;
    } catch (err) {
      console.error('Admin add lesson error', err);
      return false;
    }
  },

  adminDeleteLesson: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch (err) {
      console.error('Admin delete lesson error', err);
      return false;
    }
  },

  fetchAdminStats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) return data;
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
    return null;
  }
}));
