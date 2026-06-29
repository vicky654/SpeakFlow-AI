"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbService_1 = require("../config/dbService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/challenge/progress
router.get('/progress', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let progress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (!progress) {
            // Create default progress
            progress = await dbService_1.dbService.challengeProgress.upsert(userId, {
                currentDay: 1,
                completedDays: [],
                dailyStatus: {
                    1: { status: 'current' }
                },
                answersSaved: {},
                xpEarned: 0,
                coinsEarned: 0,
                longestStreak: 0,
                luckySpinsLeftToday: 1
            });
        }
        return res.status(200).json(progress);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// GET /api/challenge/day/:dayNumber
router.get('/day/:dayNumber', auth_1.authenticateToken, async (req, res) => {
    try {
        const dayNum = parseInt(req.params.dayNumber);
        const userId = req.user.id;
        if (dayNum < 1 || dayNum > 15) {
            return res.status(400).json({ error: 'Invalid challenge day.' });
        }
        // Verify unlocked state
        let progress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (!progress) {
            progress = await dbService_1.dbService.challengeProgress.upsert(userId, {});
        }
        const dayStatus = progress.dailyStatus[dayNum];
        if (dayNum > 1 && (!dayStatus || dayStatus.status === 'locked')) {
            return res.status(403).json({ error: 'This challenge day is currently locked. Complete previous days to unlock.' });
        }
        const dayContent = await dbService_1.dbService.challengeDays.findByDayNumber(dayNum);
        if (!dayContent) {
            return res.status(404).json({ error: 'Challenge day content not found.' });
        }
        return res.status(200).json(dayContent);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// PUT /api/challenge/day/:dayNumber
router.put('/day/:dayNumber', auth_1.authenticateToken, async (req, res) => {
    try {
        const dayNum = parseInt(req.params.dayNumber);
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin credentials required to modify challenge day curriculum.' });
        }
        const updated = await dbService_1.dbService.challengeDays.update(dayNum, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Challenge day content not found.' });
        }
        return res.status(200).json({ message: `Day ${dayNum} curriculum updated successfully!`, content: updated });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/challenge/day/:dayNumber/complete
router.post('/day/:dayNumber/complete', auth_1.authenticateToken, async (req, res) => {
    try {
        const dayNum = parseInt(req.params.dayNumber);
        const userId = req.user.id;
        const { answers, quizScore } = req.body;
        if (dayNum < 1 || dayNum > 15) {
            return res.status(400).json({ error: 'Invalid challenge day.' });
        }
        let progress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (!progress) {
            progress = await dbService_1.dbService.challengeProgress.upsert(userId, {});
        }
        // 1. Update dailyStatus and completedDays
        const dailyStatus = { ...progress.dailyStatus };
        const completedDays = [...progress.completedDays];
        dailyStatus[dayNum] = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            quizScore
        };
        if (!completedDays.includes(dayNum)) {
            completedDays.push(dayNum);
        }
        // 2. Unlock the next day if dayNum < 15
        const nextDay = dayNum + 1;
        if (nextDay <= 15) {
            dailyStatus[nextDay] = {
                status: 'current'
            };
        }
        // 3. Award XP & Coins (e.g. +150 XP, +25 Coins per completed day)
        const xpBonus = 150;
        const coinsBonus = 25;
        const newXpEarned = progress.xpEarned + xpBonus;
        const newCoinsEarned = progress.coinsEarned + coinsBonus;
        // 4. Update user profile counters
        const user = await dbService_1.dbService.users.findById(userId);
        if (user) {
            const mode = user.currentLevelMode;
            const progressObj = { ...user.levelProgress };
            progressObj[mode].xp = (progressObj[mode].xp || 0) + xpBonus;
            progressObj[mode].completedLessons = [...(progressObj[mode].completedLessons || []), `challenge-day-${dayNum}`];
            const newStreak = user.streak + 1;
            const newLongestStreak = Math.max(progress.longestStreak, newStreak);
            await dbService_1.dbService.users.update(userId, {
                coins: user.coins + coinsBonus,
                streak: newStreak,
                levelProgress: progressObj
            });
            const answersSaved = { ...progress.answersSaved };
            answersSaved[dayNum] = answers;
            const updatedProgress = await dbService_1.dbService.challengeProgress.upsert(userId, {
                currentDay: nextDay <= 15 ? nextDay : 15,
                completedDays,
                dailyStatus,
                answersSaved,
                xpEarned: newXpEarned,
                coinsEarned: newCoinsEarned,
                longestStreak: newLongestStreak
            });
            return res.status(200).json({
                message: `Day ${dayNum} completed successfully!`,
                xpGained: xpBonus,
                coinsGained: coinsBonus,
                progress: updatedProgress
            });
        }
        return res.status(404).json({ error: 'User profile not found.' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/challenge/lucky-spin
router.post('/lucky-spin', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let progress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (!progress) {
            progress = await dbService_1.dbService.challengeProgress.upsert(userId, {});
        }
        // 1. Verify spins left
        if (progress.luckySpinsLeftToday <= 0) {
            // Allow spinning for 10 coins cost
            const user = await dbService_1.dbService.users.findById(userId);
            if (!user || user.coins < 10) {
                return res.status(400).json({ error: 'No free spins left and insufficient coins (requires 10 coins).' });
            }
            // Deduct coins
            await dbService_1.dbService.users.update(userId, { coins: user.coins - 10 });
        }
        else {
            // Deduct free spin
            await dbService_1.dbService.challengeProgress.upsert(userId, {
                luckySpinsLeftToday: progress.luckySpinsLeftToday - 1
            });
        }
        // 2. Select prize
        const prizes = [
            { type: 'XP', amount: 50, label: '+50 XP Bonus' },
            { type: 'Coins', amount: 15, label: '+15 Coins' },
            { type: 'XP', amount: 100, label: '+100 XP Super Jackpot' },
            { type: 'Coins', amount: 5, label: '+5 Coins' },
            { type: 'Coins', amount: 30, label: '+30 Coins Jackpot' },
            { type: 'XP', amount: 20, label: '+20 XP' }
        ];
        const randomIndex = Math.floor(Math.random() * prizes.length);
        const prizeSelected = prizes[randomIndex];
        // 3. Credit prize
        const userProfile = await dbService_1.dbService.users.findById(userId);
        if (userProfile) {
            if (prizeSelected.type === 'XP') {
                const mode = userProfile.currentLevelMode;
                const progressObj = { ...userProfile.levelProgress };
                progressObj[mode].xp = (progressObj[mode].xp || 0) + prizeSelected.amount;
                await dbService_1.dbService.users.update(userId, { levelProgress: progressObj });
            }
            else if (prizeSelected.type === 'Coins') {
                await dbService_1.dbService.users.update(userId, { coins: userProfile.coins + prizeSelected.amount });
            }
        }
        // Refresh progress state
        const currentProgress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        return res.status(200).json({
            prize: prizeSelected,
            progress: currentProgress
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
// POST /api/challenge/daily-reward (Chest)
router.post('/daily-reward', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        let progress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (!progress) {
            progress = await dbService_1.dbService.challengeProgress.upsert(userId, {});
        }
        if (progress.lastClaimedDailyChest === today) {
            return res.status(400).json({ error: 'You have already claimed today\'s chest reward. Return tomorrow!' });
        }
        const rewardCoins = 20;
        const rewardXp = 50;
        const userProfile = await dbService_1.dbService.users.findById(userId);
        if (userProfile) {
            const mode = userProfile.currentLevelMode;
            const progressObj = { ...userProfile.levelProgress };
            progressObj[mode].xp = (progressObj[mode].xp || 0) + rewardXp;
            await dbService_1.dbService.users.update(userId, {
                coins: userProfile.coins + rewardCoins,
                levelProgress: progressObj
            });
            const updatedProgress = await dbService_1.dbService.challengeProgress.upsert(userId, {
                lastClaimedDailyChest: today,
                luckySpinsLeftToday: 1 // Reset daily lucky spin
            });
            return res.status(200).json({
                message: 'Daily chest reward claimed successfully!',
                xpGained: rewardXp,
                coinsGained: rewardCoins,
                progress: updatedProgress
            });
        }
        return res.status(404).json({ error: 'User profile not found.' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
