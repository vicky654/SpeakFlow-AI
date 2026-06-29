"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbService_1 = require("../config/dbService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'speakflow_super_secret_key_12345';
// Calculate and update daily streak
async function updateStreakIfNeeded(userId) {
    const user = await dbService_1.dbService.users.findById(userId);
    if (!user)
        return;
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
        }
        else if (diffDays > 1) {
            streak = 1; // Streak broken, restart
        }
    }
    else {
        streak = 1; // First log in
    }
    await dbService_1.dbService.users.update(userId, {
        streak,
        lastActive: today
    });
}
// REGISTER
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    try {
        const existingUser = await dbService_1.dbService.users.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = await dbService_1.dbService.users.create({
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
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                xp: newUser.levelProgress[newUser.currentLevelMode].xp,
                coins: newUser.coins,
                streak: newUser.streak,
                level: newUser.levelProgress[newUser.currentLevelMode].level,
                badges: newUser.badges,
                favorites: newUser.levelProgress[newUser.currentLevelMode].favorites,
                completedLessons: newUser.levelProgress[newUser.currentLevelMode].completedLessons
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed. Server error.' });
    }
});
// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const user = await dbService_1.dbService.users.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        // Update streak logic
        await updateStreakIfNeeded(user._id);
        const updatedUser = await dbService_1.dbService.users.findById(user._id);
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                xp: updatedUser.xp ?? 0,
                coins: updatedUser.coins ?? 0,
                streak: updatedUser.streak ?? 0,
                level: updatedUser.level ?? 1,
                badges: updatedUser.badges ?? [],
                favorites: updatedUser.favorites ?? [],
                completedLessons: updatedUser.completedLessons ?? []
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed. Server error.' });
    }
});
// GET CURRENT USER DETAILS
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await dbService_1.dbService.users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Auto streak check in case they keep session alive
        await updateStreakIfNeeded(user._id);
        const refreshed = await dbService_1.dbService.users.findById(user._id);
        res.json({
            id: refreshed._id,
            name: refreshed.name,
            email: refreshed.email,
            role: refreshed.role,
            xp: refreshed.xp ?? 0,
            coins: refreshed.coins ?? 0,
            streak: refreshed.streak ?? 0,
            level: refreshed.level ?? 1,
            badges: refreshed.badges ?? [],
            favorites: refreshed.favorites ?? [],
            completedLessons: refreshed.completedLessons ?? []
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch user. Server error.' });
    }
});
// ADD/REMOVE FAVORITE VOCABULARY WORD
router.post('/favorite', auth_1.authenticateToken, async (req, res) => {
    const { wordId } = req.body;
    if (!wordId) {
        return res.status(400).json({ message: 'wordId is required.' });
    }
    try {
        const user = await dbService_1.dbService.users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        let favorites = [...(user.favorites ?? [])];
        const index = favorites.indexOf(wordId);
        if (index === -1) {
            favorites.push(wordId);
        }
        else {
            favorites.splice(index, 1);
        }
        const updated = await dbService_1.dbService.users.update(user._id, { favorites });
        res.json({ favorites: updated.favorites ?? [] });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update favorites. Server error.' });
    }
});
exports.default = router;
