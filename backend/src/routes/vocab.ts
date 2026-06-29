import express, { Response } from 'express';
import { dbService } from '../config/dbService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET ALL WORDS
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const vocabs = await dbService.vocab.getAll();
    res.json(vocabs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vocabulary. Server error.' });
  }
});

// GET DAILY 10 WORDS (Rotates daily based on calendar date seed)
router.get('/daily', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const vocabs = await dbService.vocab.getAll();
    if (vocabs.length === 0) {
      return res.json([]);
    }

    // Get calendar day index seed
    const todayStr = new Date().toISOString().split('T')[0];
    const hash = todayStr.split('-').reduce((acc, num) => acc + parseInt(num, 10), 0);
    
    // Chunk size is 10
    const totalChunks = Math.ceil(vocabs.length / 10);
    const selectedChunk = hash % totalChunks;
    const startIndex = selectedChunk * 10;
    const dailyWords = vocabs.slice(startIndex, startIndex + 10);

    // If we have fewer than 10 words, pad it with words from the beginning
    if (dailyWords.length < 10 && vocabs.length >= 10) {
      const extraNeeded = 10 - dailyWords.length;
      dailyWords.push(...vocabs.slice(0, extraNeeded));
    }

    res.json(dailyWords);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch daily vocabulary. Server error.' });
  }
});

// MARK WORD AS LEARNED
router.post('/learned', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { wordId } = req.body;
  const userId = req.user!.id;

  if (!wordId) {
    return res.status(400).json({ message: 'wordId is required.' });
  }

  try {
    const word = await dbService.vocab.findById(wordId);
    if (!word) {
      return res.status(404).json({ message: 'Vocabulary word not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
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

    const isAlreadyLearned = progress.vocabWordsLearned.includes(wordId);
    let xpEarned = progress.xpEarned;
    let coinsEarned = progress.coinsEarned;
    let updatedLearned = [...progress.vocabWordsLearned];

    if (!isAlreadyLearned) {
      updatedLearned.push(wordId);
      xpEarned += 10; // 10 XP per word
      coinsEarned += 2; // 2 Coins per word

      // Update today's progress log
      await dbService.progress.upsert(userId, todayStr, {
        vocabWordsLearned: updatedLearned,
        xpEarned,
        coinsEarned
      });

      // Update user overall stats
      const user = await dbService.users.findById(userId);
      if (user) {
        let totalXp = user.xp + 10;
        let totalCoins = user.coins + 2;
        // Level up algorithm (every 100 XP is a level)
        let level = Math.floor(totalXp / 100) + 1;
        
        // Award badge for 10 words learned
        let badges = [...user.badges];
        if (updatedLearned.length >= 10 && !badges.includes('Vocab Starter')) {
          badges.push('Vocab Starter');
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
      message: 'Word marked as learned.',
      vocabWordsLearned: updatedLearned,
      xpGained: isAlreadyLearned ? 0 : 10,
      coinsGained: isAlreadyLearned ? 0 : 2
    });
  } catch (error) {
    console.error('Error marking word as learned:', error);
    res.status(500).json({ message: 'Failed to record vocabulary progress. Server error.' });
  }
});

export default router;
