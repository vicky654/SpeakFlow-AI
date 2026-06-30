"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbService_1 = require("../config/dbService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET ALL WORDS
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const vocabs = await dbService_1.dbService.vocab.getAll();
        res.json(vocabs);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch vocabulary. Server error.' });
    }
});
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
async function getSmartVocabList(userId, forceRefresh = false) {
    const allVocabs = await dbService_1.dbService.vocab.getAll();
    if (allVocabs.length === 0)
        return [];
    const progressHistory = await dbService_1.dbService.progress.getHistory(userId);
    const learnedWordIds = new Set();
    progressHistory.forEach(p => {
        if (p.vocabWordsLearned) {
            p.vocabWordsLearned.forEach(id => learnedWordIds.add(id.toString()));
        }
    });
    // Filter unlearned
    const unlearned = allVocabs.filter(v => !learnedWordIds.has(v._id.toString()) && !learnedWordIds.has(v.word));
    // Spaced repetition review pool: words learned >= 3 days ago
    const reviewWords = [];
    const today = new Date();
    progressHistory.forEach(p => {
        const logDate = new Date(p.date);
        const diffTime = today.getTime() - logDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 3 && p.vocabWordsLearned) {
            p.vocabWordsLearned.forEach(wId => {
                const match = allVocabs.find(v => v._id.toString() === wId.toString() || v.word === wId);
                if (match && !reviewWords.some(r => r._id.toString() === match._id.toString())) {
                    reviewWords.push(match);
                }
            });
        }
    });
    // For forceRefresh, we randomize. Otherwise, we use a date-stable ordering
    let poolUnlearned = forceRefresh ? shuffle(unlearned) : unlearned;
    let poolReview = forceRefresh ? shuffle(reviewWords) : reviewWords;
    const result = [];
    // 1. Add unlearned words first
    result.push(...poolUnlearned.slice(0, 10));
    // 2. Pad with review words if needed
    if (result.length < 10 && poolReview.length > 0) {
        const needed = 10 - result.length;
        result.push(...poolReview.slice(0, needed));
    }
    // 3. Pad with any learned words if we still don't have 10
    if (result.length < 10) {
        const learned = allVocabs.filter(v => learnedWordIds.has(v._id.toString()) || learnedWordIds.has(v.word));
        const poolLearned = forceRefresh ? shuffle(learned) : learned;
        const needed = 10 - result.length;
        result.push(...poolLearned.slice(0, needed));
    }
    return result.slice(0, 10);
}
// GET DAILY 10 WORDS
router.get('/daily', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const dailyWords = await getSmartVocabList(userId, false);
        res.json(dailyWords);
    }
    catch (error) {
        console.error('Error fetching daily vocab:', error);
        res.status(500).json({ message: 'Failed to fetch daily vocabulary. Server error.' });
    }
});
// POST REFRESH VOCABULARY WORDS
router.post('/refresh', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const freshWords = await getSmartVocabList(userId, true);
        res.json(freshWords);
    }
    catch (error) {
        console.error('Error refreshing vocab:', error);
        res.status(500).json({ message: 'Failed to refresh vocabulary. Server error.' });
    }
});
// MARK WORD AS LEARNED
router.post('/learned', auth_1.authenticateToken, async (req, res) => {
    const { wordId } = req.body;
    const userId = req.user.id;
    if (!wordId) {
        return res.status(400).json({ message: 'wordId is required.' });
    }
    try {
        const word = await dbService_1.dbService.vocab.findById(wordId);
        if (!word) {
            return res.status(404).json({ message: 'Vocabulary word not found.' });
        }
        const todayStr = new Date().toISOString().split('T')[0];
        const progress = await dbService_1.dbService.progress.findByUserAndDate(userId, todayStr) || {
            userId,
            date: todayStr,
            vocabWordsLearned: [],
            speakingTime: 0,
            readingTime: 0,
            listeningTime: 0,
            writingSubmissions: [],
            grammarQuizzesCompleted: [],
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
            await dbService_1.dbService.progress.upsert(userId, todayStr, {
                vocabWordsLearned: updatedLearned,
                xpEarned,
                coinsEarned
            });
            // Update user overall stats
            const user = await dbService_1.dbService.users.findById(userId);
            if (user) {
                let totalXp = (user.xp ?? 0) + 10;
                let totalCoins = user.coins + 2;
                // Level up algorithm (every 100 XP is a level)
                let level = Math.floor(totalXp / 100) + 1;
                // Award badge for 10 words learned
                let badges = [...user.badges];
                if (updatedLearned.length >= 10 && !badges.includes('Vocab Starter')) {
                    badges.push('Vocab Starter');
                }
                await dbService_1.dbService.users.update(userId, {
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
    }
    catch (error) {
        console.error('Error marking word as learned:', error);
        res.status(500).json({ message: 'Failed to record vocabulary progress. Server error.' });
    }
});
exports.default = router;
