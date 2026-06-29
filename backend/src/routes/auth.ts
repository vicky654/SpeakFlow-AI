import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../config/dbService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'speakflow_super_secret_key_12345';

// Calculate and update daily streak
async function updateStreakIfNeeded(userId: string) {
  const user = await dbService.users.findById(userId);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.lastActive;

  if (lastActive === today) {
    return; // Already logged in today, streak unchanged
  }

  let streak = user.streak;
  if (lastActive) {
    const lastDate = new Date(lastActive);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1; // Streak broken, restart
    }
  } else {
    streak = 1; // First log in
  }

  await dbService.users.update(userId, {
    streak,
    lastActive: today
  });
}

// REGISTER
router.post('/register', async (req: express.Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await dbService.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dbService.users.create({
      name,
      email,
      passwordHash,
      role: role || 'student',
      xp: 0,
      coins: 0,
      streak: 1,
      level: 1,
      badges: [],
      favorites: [],
      completedLessons: [],
      lastActive: new Date().toISOString().split('T')[0]
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        xp: newUser.xp,
        coins: newUser.coins,
        streak: newUser.streak,
        level: newUser.level,
        badges: newUser.badges,
        favorites: newUser.favorites,
        completedLessons: newUser.completedLessons
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Server error.' });
  }
});

// LOGIN
router.post('/login', async (req: express.Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await dbService.users.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Update streak logic
    await updateStreakIfNeeded(user._id);
    const updatedUser = await dbService.users.findById(user._id);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: updatedUser!._id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
        xp: updatedUser!.xp,
        coins: updatedUser!.coins,
        streak: updatedUser!.streak,
        level: updatedUser!.level,
        badges: updatedUser!.badges,
        favorites: updatedUser!.favorites,
        completedLessons: updatedUser!.completedLessons
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Server error.' });
  }
});

// GET CURRENT USER DETAILS
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await dbService.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Auto streak check in case they keep session alive
    await updateStreakIfNeeded(user._id);
    const refreshed = await dbService.users.findById(user._id);

    res.json({
      id: refreshed!._id,
      name: refreshed!.name,
      email: refreshed!.email,
      role: refreshed!.role,
      xp: refreshed!.xp,
      coins: refreshed!.coins,
      streak: refreshed!.streak,
      level: refreshed!.level,
      badges: refreshed!.badges,
      favorites: refreshed!.favorites,
      completedLessons: refreshed!.completedLessons
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user. Server error.' });
  }
});

// ADD/REMOVE FAVORITE VOCABULARY WORD
router.post('/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { wordId } = req.body;

  if (!wordId) {
    return res.status(400).json({ message: 'wordId is required.' });
  }

  try {
    const user = await dbService.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let favorites = [...user.favorites];
    const index = favorites.indexOf(wordId);
    
    if (index === -1) {
      favorites.push(wordId);
    } else {
      favorites.splice(index, 1);
    }

    const updated = await dbService.users.update(user._id, { favorites });
    res.json({ favorites: updated!.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update favorites. Server error.' });
  }
});

export default router;
