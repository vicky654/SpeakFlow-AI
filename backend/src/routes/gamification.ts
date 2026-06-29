import express, { Response } from 'express';
import { dbService } from '../config/dbService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET LEADERBOARD (Top 10 users by XP, with mock users populated if DB is fresh)
router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbService.users.getAll();
    
    // Format response list
    let leaderboard = users.map(u => ({
      id: u._id,
      name: u.name,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      role: u.role
    }));

    // If there are less than 5 users, inject some synthetic users for gaming feel
    if (leaderboard.length < 5) {
      const mockPeers: any[] = [
        { id: 'm1', name: 'Rohan Sharma', xp: 450, level: 5, streak: 8, role: 'student' },
        { id: 'm2', name: 'Sneha Patel', xp: 380, level: 4, streak: 5, role: 'professional' },
        { id: 'm3', name: 'Emily Watson', xp: 320, level: 4, streak: 12, role: 'student' },
        { id: 'm4', name: 'Aarav Mehta', xp: 210, level: 3, streak: 3, role: 'job_seeker' },
        { id: 'm5', name: 'Vikram Singh', xp: 120, level: 2, streak: 2, role: 'professional' }
      ];
      
      // Filter out duplicate names if already registered
      mockPeers.forEach(mock => {
        if (!leaderboard.some(u => u.name.toLowerCase() === mock.name.toLowerCase())) {
          leaderboard.push(mock);
        }
      });
    }

    // Sort descending by XP
    leaderboard.sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve leaderboard. Server error.' });
  }
});

// GET DAILY CHALLENGE PROGRESS
router.get('/daily-challenge', authenticateToken, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const progress = await dbService.progress.findByUserAndDate(userId, todayStr) || {
      userId,
      date: todayStr,
      vocabWordsLearned: [] as string[],
      speakingTime: 0,
      readingTime: 0,
      listeningTime: 0,
      writingSubmissions: [] as any[],
      grammarQuizzesCompleted: [] as any[],
      dailyChallengeCompleted: false,
      xpEarned: 0,
      coinsEarned: 0
    };

    // Rule checklist:
    const vocabCount = progress.vocabWordsLearned.length;
    const speakingSecs = progress.speakingTime;
    const readingSecs = progress.readingTime;
    const listeningSecs = progress.listeningTime;
    const writingCount = progress.writingSubmissions.length;
    const quizCount = progress.grammarQuizzesCompleted.length;

    const checklist = {
      vocab: { current: vocabCount, target: 10, completed: vocabCount >= 10 },
      speaking: { current: Math.round(speakingSecs / 60), target: 1, completed: speakingSecs >= 45 }, // at least 45 seconds of speaking
      reading: { current: Math.round(readingSecs / 60), target: 1, completed: readingSecs >= 45 },   // at least 45 seconds of reading
      listening: { current: Math.round(listeningSecs / 60), target: 1, completed: listeningSecs >= 45 }, // at least 45 seconds of listening
      writing: { current: writingCount, target: 1, completed: writingCount >= 1 },
      quiz: { current: quizCount, target: 1, completed: quizCount >= 1 }
    };

    const allCompleted = 
      checklist.vocab.completed &&
      checklist.speaking.completed &&
      checklist.reading.completed &&
      checklist.listening.completed &&
      checklist.writing.completed &&
      checklist.quiz.completed;

    let claimReward = false;
    let xpAwarded = 0;
    let coinsAwarded = 0;

    // Auto-claim reward once if all completed
    if (allCompleted && !progress.dailyChallengeCompleted) {
      claimReward = true;
      xpAwarded = 100;
      coinsAwarded = 20;

      // Update progress
      await dbService.progress.upsert(userId, todayStr, {
        dailyChallengeCompleted: true,
        xpEarned: progress.xpEarned + xpAwarded,
        coinsEarned: progress.coinsEarned + coinsAwarded
      });

      // Update user overall rewards
      const user = await dbService.users.findById(userId);
      if (user) {
        const totalXp = (user.xp ?? 0) + xpAwarded;
        const totalCoins = user.coins + coinsAwarded;
        const level = Math.floor(totalXp / 100) + 1;
        
        let badges = [...user.badges];
        if (!badges.includes('Daily Champion')) {
          badges.push('Daily Champion');
        }

        await dbService.users.update(userId, {
          xp: totalXp,
          coins: totalCoins,
          level,
          badges
        });
      }
    }

    res.json({
      date: todayStr,
      checklist,
      allCompleted,
      rewardClaimed: progress.dailyChallengeCompleted || claimReward,
      rewards: { xp: xpAwarded, coins: coinsAwarded }
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    res.status(500).json({ message: 'Failed to retrieve daily challenge progress. Server error.' });
  }
});

// GET BADGES DICTIONARY
router.get('/badges-list', authenticateToken, async (req: AuthRequest, res: Response) => {
  const BADGES_DATABASE = [
    { id: 'Vocab Starter', title: 'Vocab Starter', description: 'Learned 10 new English words in a single day.', icon: '🏆' },
    { id: 'Scholar', title: 'Scholar', description: 'Completed 3 courses or grammar lessons.', icon: '🎓' },
    { id: 'Orator', title: 'Orator', description: 'Practiced speaking scenarios for 10 minutes total.', icon: '🎙️' },
    { id: 'Wordsmith', title: 'Wordsmith', description: 'Completed 3 writing assignments.', icon: '✍️' },
    { id: 'Fluent Speaker', title: 'Fluent Speaker', description: 'Practiced speaking for 5 minutes total.', icon: '🗣️' },
    { id: 'Daily Champion', title: 'Daily Champion', description: 'Completed all challenges in a Daily Challenge checklist.', icon: '⚡' }
  ];
  
  try {
    const user = await dbService.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resBadges = BADGES_DATABASE.map(b => ({
      ...b,
      earned: user.badges.includes(b.id)
    }));

    res.json(resBadges);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch badges list. Server error.' });
  }
});

export default router;
