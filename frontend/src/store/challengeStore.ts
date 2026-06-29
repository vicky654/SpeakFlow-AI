import { create } from 'zustand';
import { useAuthStore } from './authStore';
import API_BASE_URL from '../config/api';

export interface IDayStatus {
  status: 'locked' | 'completed' | 'current' | 'missed';
  completedAt?: string;
  quizScore?: number;
}

export interface IChallengeProgress {
  userId: string;
  currentDay: number;
  completedDays: number[];
  dailyStatus: Record<number, IDayStatus>;
  answersSaved: Record<number, any>;
  xpEarned: number;
  coinsEarned: number;
  longestStreak: number;
  lastClaimedDailyChest?: string;
  luckySpinsLeftToday: number;
  updatedAt: string;
}

interface ChallengeState {
  progress: IChallengeProgress | null;
  activeDayContent: any | null;
  loading: boolean;
  error: string | null;

  fetchProgress: () => Promise<void>;
  fetchDayContent: (dayNumber: number) => Promise<any | null>;
  completeDay: (dayNumber: number, answers: any, quizScore: number) => Promise<any | null>;
  rollLuckySpin: () => Promise<any | null>;
  claimDailyChest: () => Promise<any | null>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  progress: null,
  activeDayContent: null,
  loading: false,
  error: null,

  fetchProgress: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/challenge/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch challenge progress.');
      const data = await res.json();
      set({ progress: data, loading: false });

      // Save locally to cache for Offline Mode
      localStorage.setItem('cached_challenge_progress', JSON.stringify(data));
    } catch (err: any) {
      // Offline fallback
      const cached = localStorage.getItem('cached_challenge_progress');
      if (cached) {
        set({ progress: JSON.parse(cached), loading: false });
      } else {
        set({ error: err.message, loading: false });
      }
    }
  },

  fetchDayContent: async (dayNumber: number) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/challenge/day/${dayNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load challenge day content.');
      const data = await res.json();
      set({ activeDayContent: data, loading: false });

      // Cache this day for Offline study
      localStorage.setItem(`cached_day_${dayNumber}`, JSON.stringify(data));
      return data;
    } catch (err: any) {
      // Offline fallback
      const cached = localStorage.getItem(`cached_day_${dayNumber}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set({ activeDayContent: parsed, loading: false });
        return parsed;
      }
      set({ error: err.message, loading: false });
      return null;
    }
  },

  completeDay: async (dayNumber: number, answers: any, quizScore: number) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/challenge/day/${dayNumber}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers, quizScore })
      });
      if (!res.ok) throw new Error('Failed to complete challenge day.');
      const data = await res.json();
      set({ progress: data.progress, loading: false });

      // Sync user profile points in authStore
      const loadUser = useAuthStore.getState().loadUser;
      await loadUser();

      // Save locally to cache
      localStorage.setItem('cached_challenge_progress', JSON.stringify(data.progress));
      return data;
    } catch (err: any) {
      // Offline Mode support: Save to sync queue, update local mock progress
      const progress = get().progress;
      if (progress) {
        const updatedStatus = { ...progress.dailyStatus };
        updatedStatus[dayNumber] = {
          status: 'completed',
          completedAt: new Date().toISOString(),
          quizScore
        };
        const nextDay = dayNumber + 1;
        if (nextDay <= 15) {
          updatedStatus[nextDay] = { status: 'current' };
        }
        const updatedCompleted = [...progress.completedDays];
        if (!updatedCompleted.includes(dayNumber)) updatedCompleted.push(dayNumber);

        const mockProgress: IChallengeProgress = {
          ...progress,
          currentDay: nextDay <= 15 ? nextDay : 15,
          completedDays: updatedCompleted,
          dailyStatus: updatedStatus,
          xpEarned: progress.xpEarned + 150,
          coinsEarned: progress.coinsEarned + 25
        };

        set({ progress: mockProgress, loading: false });
        localStorage.setItem('cached_challenge_progress', JSON.stringify(mockProgress));

        // Queue completion inside offline_sync
        const syncQueueRaw = localStorage.getItem('offline_challenge_sync_queue') || '[]';
        const queue = JSON.parse(syncQueueRaw);
        queue.push({ dayNumber, answers, quizScore, timestamp: new Date().toISOString() });
        localStorage.setItem('offline_challenge_sync_queue', JSON.stringify(queue));
      }
      return null;
    }
  },

  rollLuckySpin: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/challenge/lucky-spin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Lucky spin rejected.');
      const data = await res.json();
      set({ progress: data.progress });
      
      const loadUser = useAuthStore.getState().loadUser;
      await loadUser();
      
      localStorage.setItem('cached_challenge_progress', JSON.stringify(data.progress));
      return data;
    } catch (err: any) {
      alert(`Offline mode active. Spin roll unavailable.`);
      return null;
    }
  },

  claimDailyChest: async () => {
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_BASE_URL}/challenge/daily-reward`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to claim daily reward chest.');
      const data = await res.json();
      set({ progress: data.progress });
      
      const loadUser = useAuthStore.getState().loadUser;
      await loadUser();
      
      localStorage.setItem('cached_challenge_progress', JSON.stringify(data.progress));
      return data;
    } catch (err: any) {
      alert(`Offline mode active. Login chest claims require internet connection.`);
      return null;
    }
  }
}));
