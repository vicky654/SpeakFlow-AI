"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dbService_1 = require("../config/dbService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/ai-coach/report
router.get('/report', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const progressHistory = await dbService_1.dbService.progress.getHistory(userId);
        const challengeProgress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        const userProfile = await dbService_1.dbService.users.findById(userId);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }
        // 1. Gather stats
        let totalSpeakingTime = 0;
        let totalListeningTime = 0;
        let totalWritingCount = 0;
        let totalGrammarScoresSum = 0;
        let totalGrammarCount = 0;
        progressHistory.forEach(p => {
            totalSpeakingTime += p.speakingTime || 0;
            totalListeningTime += p.listeningTime || 0;
            totalWritingCount += p.writingSubmissions?.length || 0;
            p.grammarQuizzesCompleted?.forEach(q => {
                totalGrammarScoresSum += q.score || 0;
                totalGrammarCount += 1;
            });
        });
        const grammarAverage = totalGrammarCount > 0 ? Math.round(totalGrammarScoresSum / totalGrammarCount) : 80;
        // 2. Recommend next learning path based on day completions
        const currentDay = challengeProgress?.currentDay || 1;
        const completedCount = challengeProgress?.completedDays?.length || 0;
        const recommendations = [];
        if (completedCount < 15) {
            recommendations.push({
                type: 'Challenge',
                title: `Resume Day ${currentDay} Challenge`,
                description: 'Finish today\'s comprehensive curriculum to maintain your learning streak.'
            });
        }
        // Identify weaker skills based on scores
        if (grammarAverage < 85) {
            recommendations.push({
                type: 'Grammar',
                title: 'Review Continuous & Perfect Tenses',
                description: 'Your quiz performance shows space for optimization in complex tense structures.'
            });
        }
        if (totalSpeakingTime < 180) {
            recommendations.push({
                type: 'Speaking',
                title: 'Complete a Situational Speaking Drill',
                description: 'Spend 3 minutes practicing oral expression to accelerate pitch and fluency pacing.'
            });
        }
        // 3. Generate daily coach motivational messages
        const motivationalQuotes = [
            "Consistent practice builds fluent pathways in the brain. Keep moving!",
            "Don't worry about pronunciation accents. Focus on articulation clarity.",
            "Each email you draft gets you one step closer to executive-level communication.",
            "Even 5 minutes of daily listening expands vocabulary retention dramatically."
        ];
        const dailyMessage = motivationalQuotes[currentDay % motivationalQuotes.length];
        return res.status(200).json({
            reportDate: new Date().toLocaleDateString(),
            curriculumProgress: {
                completedDays: completedCount,
                percentComplete: Math.round((completedCount / 15) * 100),
                activeStreak: userProfile.streak,
                xpTotal: userProfile.xp,
                coinsBalance: userProfile.coins
            },
            skillsAnalytics: {
                speakingMinutes: Math.round(totalSpeakingTime / 60),
                listeningMinutes: Math.round(totalListeningTime / 60),
                writingSubmissions: totalWritingCount,
                grammarAverageAccuracy: grammarAverage
            },
            dailyMotivationalMessage: dailyMessage,
            coachRecommendations: recommendations.length > 0 ? recommendations : [
                {
                    type: 'Curriculum',
                    title: 'Master Class Graduate Status',
                    description: 'Fantastic! You have completed all challenge curriculum goals. Keep drilling cards daily.'
                }
            ]
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.default = router;
