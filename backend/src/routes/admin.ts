import express, { Response } from 'express';
import { dbService } from '../config/dbService';
import { authenticateToken, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ADMIN: ADD NEW VOCABULARY WORD
router.post('/vocab', authenticateToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const newVocab = await dbService.vocab.create(req.body);
    res.status(201).json(newVocab);
  } catch (error) {
    console.error('Admin Vocab creation error:', error);
    res.status(500).json({ message: 'Failed to create vocabulary word. Server error.' });
  }
});

// ADMIN: DELETE VOCABULARY WORD
router.delete('/vocab/:id', authenticateToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbService.vocab.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Vocab word not found.' });
    }
    res.json({ message: 'Vocab word deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vocab. Server error.' });
  }
});

// ADMIN: ADD NEW LESSON / READING / LISTENING / INTERVIEW TOPIC
router.post('/lessons', authenticateToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const newLesson = await dbService.lessons.create(req.body);
    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Admin Lesson creation error:', error);
    res.status(500).json({ message: 'Failed to create lesson. Server error.' });
  }
});

// ADMIN: DELETE LESSON
router.delete('/lessons/:id', authenticateToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbService.lessons.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }
    res.json({ message: 'Lesson deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete lesson. Server error.' });
  }
});

// ADMIN: PLATFORM STATISTICS
router.get('/stats', authenticateToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await dbService.users.getAll();
    const allVocabs = await dbService.vocab.getAll();
    const lessonsList = [
      ...(await dbService.lessons.getByType('grammar')),
      ...(await dbService.lessons.getByType('reading')),
      ...(await dbService.lessons.getByType('listening')),
      ...(await dbService.lessons.getByType('interview'))
    ];

    // Compute basic aggregations
    const userCount = allUsers.length;
    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const studentCount = allUsers.filter(u => u.role === 'student').length;
    const professionalCount = allUsers.filter(u => u.role === 'professional').length;
    const jobSeekerCount = allUsers.filter(u => u.role === 'job_seeker').length;

    const totalXP = allUsers.reduce((sum, u) => sum + (u.xp || 0), 0);
    const averageStreak = userCount > 0 ? (allUsers.reduce((sum, u) => sum + (u.streak || 0), 0) / userCount).toFixed(1) : 0;
    
    res.json({
      summary: {
        users: userCount,
        vocabulary: allVocabs.length,
        lessons: lessonsList.length
      },
      roles: {
        admin: adminCount,
        student: studentCount,
        professional: professionalCount,
        jobSeeker: jobSeekerCount
      },
      metrics: {
        totalXp: totalXP,
        averageStreak: Number(averageStreak)
      }
    });
  } catch (error) {
    console.error('Admin Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics. Server error.' });
  }
});

export default router;
