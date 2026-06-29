import { useChallengeStore } from '../store/challengeStore';

export const offlineCache = {
  /**
   * Sync offline queued completions back to the backend database.
   */
  async syncOfflineQueue(): Promise<void> {
    const queueRaw = localStorage.getItem('offline_challenge_sync_queue');
    if (!queueRaw) return;

    const queue = JSON.parse(queueRaw);
    if (queue.length === 0) return;

    console.log(`[Offline Cache] Found ${queue.length} challenge completions in sync queue. Syncing now...`);
    const completeDay = useChallengeStore.getState().completeDay;

    // Process queue items sequentially
    const successfulItems: any[] = [];
    for (const item of queue) {
      try {
        const result = await completeDay(item.dayNumber, item.answers, item.quizScore);
        if (result) {
          successfulItems.push(item);
        }
      } catch (err) {
        console.error(`[Offline Cache] Failed to sync Day ${item.dayNumber} completion:`, err);
        break; // Pause syncing if network is still down
      }
    }

    // Filter queue to remove successfully synced items
    const remainingQueue = queue.filter((q: any) => !successfulItems.includes(q));
    if (remainingQueue.length > 0) {
      localStorage.setItem('offline_challenge_sync_queue', JSON.stringify(remainingQueue));
    } else {
      localStorage.removeItem('offline_challenge_sync_queue');
    }
  },

  /**
   * Monitor online status to trigger automatic syncing
   */
  initSyncListener(): void {
    window.addEventListener('online', () => {
      console.log('[Offline Cache] Network connectivity restored. Initiating queue sync...');
      this.syncOfflineQueue();
    });
    // Check on startup
    if (navigator.onLine) {
      this.syncOfflineQueue();
    }
  }
};
