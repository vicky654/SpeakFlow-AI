"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbService_1 = require("../config/dbService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET ALL LESSONS / STORIES / TOPICS
// Query params: ?type=grammar|reading|listening|interview
router.get('/lessons', auth_1.authenticateToken, async (req, res) => {
    const { type } = req.query;
    if (!type || !['grammar', 'reading', 'listening', 'interview'].includes(type)) {
        return res.status(400).json({ message: 'Valid type query param is required.' });
    }
    try {
        const lessons = await dbService_1.dbService.lessons.getByType(type);
        res.json(lessons);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch lessons. Server error.' });
    }
});
// GET LESSON BY ID
router.get('/lessons/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const lesson = await dbService_1.dbService.lessons.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }
        res.json(lesson);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch lesson details. Server error.' });
    }
});
// SUBMIT QUIZ
router.post('/lessons/:id/quiz', auth_1.authenticateToken, async (req, res) => {
    const { answers } = req.body; // e.g. { "q1": "Answer A", "q2": "Answer B" }
    const userId = req.user.id;
    const lessonId = req.params.id;
    try {
        const lesson = await dbService_1.dbService.lessons.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found.' });
        }
        const questions = lesson.metadata.questions || [];
        if (questions.length === 0) {
            return res.status(400).json({ message: 'This lesson does not have a quiz.' });
        }
        let correctCount = 0;
        const results = questions.map(q => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            if (isCorrect)
                correctCount++;
            return {
                questionId: q.id,
                userAnswer,
                correctAnswer: q.answer,
                isCorrect,
                explanation: q.explanation ?? ''
            };
        });
        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= 80;
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
        // Update progress records
        const updatedQuizzes = [...(progress.grammarQuizzesCompleted || [])];
        updatedQuizzes.push({
            lessonId,
            score,
            totalQuestions: questions.length,
            completedAt: new Date().toISOString()
        });
        let xpGained = 20; // XP for quiz attempt
        let coinsGained = 2;
        if (passed) {
            xpGained += 30; // +30 XP bonus for passing
            coinsGained += 5; // +5 Coins bonus
        }
        const updatedXpEarned = progress.xpEarned + xpGained;
        const updatedCoinsEarned = progress.coinsEarned + coinsGained;
        await dbService_1.dbService.progress.upsert(userId, todayStr, {
            grammarQuizzesCompleted: updatedQuizzes,
            xpEarned: updatedXpEarned,
            coinsEarned: updatedCoinsEarned
        });
        // Update user profile completion & rewards
        const user = await dbService_1.dbService.users.findById(userId);
        if (user) {
            const completed = [...(user.completedLessons ?? [])];
            if (!completed.includes(lessonId) && passed) {
                completed.push(lessonId);
            }
            const totalXp = (user.xp ?? 0) + xpGained;
            const totalCoins = (user.coins ?? 0) + coinsGained;
            const level = Math.floor(totalXp / 100) + 1;
            // Award badge if they completed 3 lessons
            let badges = [...(user.badges ?? [])];
            if (completed.length >= 3 && !badges.includes('Scholar')) {
                badges.push('Scholar');
            }
            await dbService_1.dbService.users.update(userId, {
                completedLessons: completed,
                xp: totalXp,
                coins: totalCoins,
                level,
                badges
            });
        }
        res.json({
            score,
            passed,
            results,
            xpGained,
            coinsGained
        });
    }
    catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ message: 'Failed to process quiz submission. Server error.' });
    }
});
// LOG PRACTICE TIME (Speaking, Listening, Reading duration in seconds)
router.post('/practice/time', auth_1.authenticateToken, async (req, res) => {
    const { skill, duration } = req.body; // skill: 'speaking' | 'listening' | 'reading', duration in seconds
    const userId = req.user.id;
    if (!skill || !['speaking', 'listening', 'reading'].includes(skill) || typeof duration !== 'number') {
        return res.status(400).json({ message: 'Valid skill and numeric duration (seconds) are required.' });
    }
    try {
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
        let speakingTime = progress.speakingTime;
        let listeningTime = progress.listeningTime;
        let readingTime = progress.readingTime;
        if (skill === 'speaking')
            speakingTime += duration;
        if (skill === 'listening')
            listeningTime += duration;
        if (skill === 'reading')
            readingTime += duration;
        // Award 5 XP per minute of practice (cap at 50 XP per day per skill)
        const minutesAdded = Math.floor(duration / 60);
        const xpGained = Math.min(25, minutesAdded * 5);
        const coinsGained = Math.floor(minutesAdded / 2);
        const updatedXp = progress.xpEarned + xpGained;
        const updatedCoins = progress.coinsEarned + coinsGained;
        await dbService_1.dbService.progress.upsert(userId, todayStr, {
            speakingTime,
            listeningTime,
            readingTime,
            xpEarned: updatedXp,
            coinsEarned: updatedCoins
        });
        const user = await dbService_1.dbService.users.findById(userId);
        if (user && xpGained > 0) {
            const totalXp = (user.xp ?? 0) + xpGained;
            const totalCoins = (user.coins ?? 0) + coinsGained;
            const level = Math.floor(totalXp / 100) + 1;
            let badges = [...(user.badges ?? [])];
            if (skill === 'speaking' && speakingTime >= 600 && !badges.includes('Orator')) {
                badges.push('Orator');
            }
            await dbService_1.dbService.users.update(userId, {
                xp: totalXp,
                coins: totalCoins,
                level,
                badges
            });
        }
        res.json({
            message: 'Practice session logged.',
            skills: { speakingTime, listeningTime, readingTime },
            xpGained,
            coinsGained
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update practice logs. Server error.' });
    }
});
// SUBMIT WRITING PRACTICE (with simulated grammar suggestions, vocabulary and rating scores)
router.post('/practice/writing', auth_1.authenticateToken, async (req, res) => {
    const { prompt, submission } = req.body;
    const userId = req.user.id;
    if (!prompt || !submission) {
        return res.status(400).json({ message: 'Prompt and submission text are required.' });
    }
    try {
        // Generate simulated AI feedback
        const words = submission.trim().split(/\s+/);
        const length = words.length;
        let baseScore = Math.min(100, Math.floor(length / 2) + 40); // Length based base
        const feedback = [];
        const suggestions = [];
        // Analyze case usage
        const lowercaseSentences = submission.match(/(?:\.|\?|!)\s+[a-z]/g);
        if (lowercaseSentences || /^[a-z]/.test(submission)) {
            baseScore -= 10;
            feedback.push('⚠️ Proper Capitalization: Capitalize the first letter of each sentence.');
        }
        // Analyze common filler words
        const simpleWords = ['good', 'bad', 'happy', 'sad', 'big', 'small', 'nice', 'very'];
        const usedSimpleWords = simpleWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(submission));
        if (usedSimpleWords.length > 0) {
            baseScore -= (usedSimpleWords.length * 3);
            const synonymsMap = {
                good: 'excellent, marvelous, beneficial',
                bad: 'detrimental, unfavorable, subpar',
                happy: 'delighted, ecstatic, content',
                sad: 'melancholic, sorrowful, dejected',
                big: 'immense, substantial, vast',
                small: 'minute, minor, compact',
                nice: 'pleasant, cordial, amiable',
                very: 'exceptionally, considerably, highly'
            };
            usedSimpleWords.slice(0, 3).forEach(w => {
                suggestions.push(`💡 Vocabulary: Swap simple word "${w}" with advanced synonyms like: ${synonymsMap[w]}.`);
            });
        }
        if (length < 15) {
            baseScore -= 15;
            feedback.push('⚠️ Elaborate Further: Try writing at least 2-3 sentences to convey a clearer idea.');
        }
        else {
            feedback.push('✅ Good length: You provided detailed thoughts.');
        }
        const finalScore = Math.max(20, Math.min(100, baseScore));
        const allFeedback = [...feedback, ...suggestions];
        if (allFeedback.length === 1 && finalScore > 85) {
            allFeedback.push('✨ Excellent grammar and word diversity!');
        }
        // Update progress log
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
        const updatedSubmissions = [...(progress.writingSubmissions || [])];
        const newSubmissionObj = {
            prompt,
            submission,
            score: finalScore,
            feedback: allFeedback,
            submittedAt: new Date().toISOString()
        };
        updatedSubmissions.push(newSubmissionObj);
        const xpGained = 30; // 30 XP per writing
        const coinsGained = 5;
        await dbService_1.dbService.progress.upsert(userId, todayStr, {
            writingSubmissions: updatedSubmissions,
            xpEarned: progress.xpEarned + xpGained,
            coinsEarned: progress.coinsEarned + coinsGained
        });
        const user = await dbService_1.dbService.users.findById(userId);
        if (user) {
            const totalXp = (user.xp ?? 0) + xpGained;
            const totalCoins = (user.coins ?? 0) + coinsGained;
            const level = Math.floor(totalXp / 100) + 1;
            let badges = [...user.badges];
            if (updatedSubmissions.length >= 3 && !badges.includes('Wordsmith')) {
                badges.push('Wordsmith');
            }
            await dbService_1.dbService.users.update(userId, {
                xp: totalXp,
                coins: totalCoins,
                level,
                badges
            });
        }
        res.json({
            score: finalScore,
            feedback: allFeedback,
            xpGained,
            coinsGained
        });
    }
    catch (error) {
        console.error('Writing practice error:', error);
        res.status(500).json({ message: 'Failed to evaluate writing submission. Server error.' });
    }
});
// EVALUATE SPEAKING PRACTICE (Accepts transcription from Web Speech API and mock-evaluates delivery/fluency)
router.post('/practice/speaking/evaluate', auth_1.authenticateToken, async (req, res) => {
    const { scenarioTitle, transcript, duration } = req.body; // duration in seconds
    const userId = req.user.id;
    if (!scenarioTitle || !transcript) {
        return res.status(400).json({ message: 'Scenario title and transcription text are required.' });
    }
    try {
        const words = transcript.trim().split(/\s+/);
        const wordCount = words.length;
        const activeSecs = duration || 10;
        // Words per minute calculation
        const wpm = Math.round((wordCount / activeSecs) * 60);
        // Mock metrics
        let fluencyScore = Math.max(50, Math.min(98, 100 - (activeSecs > 0 ? (transcript.match(/\b(um|uh|like|er)\b/gi) || []).length * 8 : 0)));
        let pronunciationScore = Math.floor(Math.random() * 15) + 80; // random 80-95
        let confidenceScore = Math.floor(Math.random() * 12) + 84; // random 84-96
        let grammarScore = Math.floor(Math.random() * 10) + 85;
        // Check fillers
        const fillers = transcript.match(/\b(um|uh|like|er)\b/gi) || [];
        const suggestedImprovements = [];
        if (fillers.length > 2) {
            suggestedImprovements.push(`💡 Pause instead of fillers: You said "${fillers[0]}" multiple times. Try pausing silently rather than vocalizing filler words.`);
        }
        if (wpm < 90) {
            suggestedImprovements.push(`💡 Increase tempo: Your pace is around ${wpm} WPM. Aim for 120-150 WPM to flow more naturally.`);
        }
        else if (wpm > 180) {
            suggestedImprovements.push(`💡 Slow down slightly: Your pace is around ${wpm} WPM. Try enunciating each syllable for better clarity.`);
        }
        else {
            suggestedImprovements.push(`✨ Perfect pace! Your speaking speed is ${wpm} WPM, which is optimal for comprehension.`);
        }
        if (fluencyScore < 75) {
            suggestedImprovements.push('💡 Structuring: Map out 2 key points before you start speaking to reduce search hesitation.');
        }
        const overallScore = Math.round((fluencyScore + pronunciationScore + confidenceScore + grammarScore) / 4);
        // Reward points for speaking active duration
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
        const updatedSpeakingTime = progress.speakingTime + activeSecs;
        const xpGained = 25;
        const coinsGained = 3;
        await dbService_1.dbService.progress.upsert(userId, todayStr, {
            speakingTime: updatedSpeakingTime,
            xpEarned: progress.xpEarned + xpGained,
            coinsEarned: progress.coinsEarned + coinsGained
        });
        const user = await dbService_1.dbService.users.findById(userId);
        if (user) {
            const totalXp = (user.xp ?? 0) + xpGained;
            const totalCoins = (user.coins ?? 0) + coinsGained;
            const level = Math.floor(totalXp / 100) + 1;
            let badges = [...user.badges];
            if (updatedSpeakingTime >= 300 && !badges.includes('Fluent Speaker')) {
                badges.push('Fluent Speaker');
            }
            await dbService_1.dbService.users.update(userId, {
                xp: totalXp,
                coins: totalCoins,
                level,
                badges
            });
        }
        res.json({
            overallScore,
            pronunciationScore,
            grammarScore,
            fluencyScore,
            confidenceScore,
            speakingSpeed: wpm,
            suggestedImprovements,
            xpGained,
            coinsGained
        });
    }
    catch (error) {
        console.error('Speaking analysis error:', error);
        res.status(500).json({ message: 'Failed to process speech analysis. Server error.' });
    }
});
// AI Chat Conversation
router.post('/chat/message', auth_1.authenticateToken, async (req, res) => {
    const { category, messages } = req.body; // category: e.g., 'friend', 'teacher', etc.
    if (!category || !Array.isArray(messages)) {
        return res.status(400).json({ message: 'Category and messages array are required.' });
    }
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0];
    const userText = lastUserMsg?.content?.toLowerCase() || '';
    let aiReply = '';
    let suggestions = [];
    let difficultWords = [];
    // Fetch current user progress to know which day of the challenge they are on
    const userId = req.user.id;
    let currentDayNum = 1;
    try {
        const challengeProgress = await dbService_1.dbService.challengeProgress.findByUserId(userId);
        if (challengeProgress) {
            currentDayNum = challengeProgress.currentDay;
        }
    }
    catch (e) {
        console.error('Error fetching challenge progress for AI teacher:', e);
    }
    let dayContent = null;
    try {
        dayContent = await dbService_1.dbService.challengeDays.findByDayNumber(currentDayNum);
    }
    catch (e) {
        console.error('Error loading challenge day content:', e);
    }
    // Parse questions
    if (userText.includes('mean') || userText.includes('meaning') || userText.includes('what is') || userText.includes('define')) {
        // 1. Definition Request
        let targetWord = '';
        const match = userText.match(/(?:mean|meaning of|what is|what does|define)\s+([a-zA-Z0-9_\-\s]+)/);
        if (match && match[1]) {
            targetWord = match[1].trim().replace(/\?|!/g, '');
        }
        else {
            // Fallback: extract last word
            const words = userText.split(/\s+/).filter(w => w.length > 2);
            targetWord = words[words.length - 1] || 'hello';
        }
        try {
            const allVocab = await dbService_1.dbService.vocab.getAll();
            const found = allVocab.find(v => v.word.toLowerCase() === targetWord.toLowerCase() || targetWord.toLowerCase().includes(v.word.toLowerCase()));
            if (found) {
                aiReply = `The word **"${found.word}"** means:
👉 **English Meaning:** ${found.englishMeaning}
👉 **Easy Explanation:** ${found.easyExplanation || 'A simple word to learn.'}
👉 **Hindi Meaning:** ${found.hindiMeaning}
👉 **Example Sentence:** "${found.exampleSentences[0] || 'No example sentence loaded.'}"
👉 **Memory Trick:** ${found.memoryTrick || 'N/A'}`;
                difficultWords.push(found.word);
            }
            else {
                // Look up in day vocabulary
                let dayFound = null;
                if (dayContent && dayContent.vocabulary) {
                    dayFound = dayContent.vocabulary.find((v) => v.word.toLowerCase() === targetWord.toLowerCase() || targetWord.toLowerCase().includes(v.word.toLowerCase()));
                }
                if (dayFound) {
                    aiReply = `The word **"${dayFound.word}"** means:
👉 **English Meaning:** ${dayFound.englishMeaning}
👉 **Easy Explanation:** ${dayFound.easyExplanation || 'A simple word to learn.'}
👉 **Hindi Meaning:** ${dayFound.hindiMeaning}
👉 **Example Sentence:** "${dayFound.exampleSentences[0] || 'No example sentence loaded.'}"
👉 **Memory Trick:** ${dayFound.memoryTrick || 'N/A'}`;
                    difficultWords.push(dayFound.word);
                }
                else {
                    aiReply = `I couldn't find the word **"${targetWord}"** in our dictionary.
In simple English: to define something is to explain what it is.
For example: **"Friend"** (दोस्त) is a person you like and know well. 😊
Ask me about another word from today's lesson!`;
                }
            }
        }
        catch (err) {
            aiReply = `Sorry, I couldn't search the dictionary right now. But in simple English, words have definitions to explain their meaning. Try asking again!`;
        }
    }
    else if (userText.includes('correct') || userText.includes('grammar') || userText.includes('sentence') || userText.includes('check')) {
        // 2. Sentence Correction Request
        let sentence = '';
        const match = lastUserMsg?.content?.match(/(?:correct my sentence|correct|sentence|check)\s*[:"']\s*(.+)/i);
        if (match && match[1]) {
            sentence = match[1].replace(/["']/g, '').trim();
        }
        else {
            const index = lastUserMsg?.content?.toLowerCase().indexOf('correct');
            if (index !== -1) {
                sentence = lastUserMsg?.content?.slice(index + 7).trim().replace(/^my sentence:|^sentence:|^check:/i, '').trim() || '';
            }
        }
        if (!sentence || sentence.length < 2) {
            sentence = 'I go office yesterday';
        }
        let corrected = sentence;
        let explanation = '';
        let hindi = '';
        const cleanText = sentence.toLowerCase();
        if (cleanText.includes('go office yesterday')) {
            corrected = 'I went to the office yesterday.';
            explanation = 'Since "yesterday" is in the past, use the past tense verb "went" instead of "go". Also, add the preposition "to" before the noun "office".';
            hindi = 'मैं कल ऑफिस गया था।';
        }
        else if (cleanText.includes('she don\'t') || cleanText.includes('she dont')) {
            corrected = sentence.replace(/don't|dont/i, "doesn't");
            explanation = 'For third-person singular pronouns (He, She, It), use "doesn\'t" instead of "don\'t".';
            hindi = 'वह नहीं करती है।';
        }
        else if (cleanText.includes('i am agree')) {
            corrected = sentence.replace(/am agree/i, 'agree');
            explanation = '"Agree" is already a verb. Do not put "am" before it. Just say "I agree".';
            hindi = 'मैं सहमत हूँ।';
        }
        else {
            corrected = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            if (!corrected.endsWith('.') && !corrected.endsWith('?') && !corrected.endsWith('!')) {
                corrected += '.';
            }
            explanation = 'Your sentence looks mostly correct! Make sure it starts with a capital letter and ends with a punctuation mark.';
            hindi = 'आपका वाक्य काफी हद तक सही है। हमेशा बड़े अक्षर से शुरू करें और पूर्ण विराम पर समाप्त करें।';
        }
        aiReply = `Here is the correction for your sentence:
❌ **Original:** "${sentence}"
✅ **Corrected:** "${corrected}"

💡 **Explanation:**
${explanation}

🇮🇳 **Hindi Meaning:**
"${hindi}"`;
        suggestions.push(`Try reading: "${corrected}"`);
    }
    else if (userText.includes('pronounce') || userText.includes('pronunciation') || userText.includes('say')) {
        // 3. Pronunciation Guide Request
        let targetWord = 'hello';
        const match = userText.match(/(?:pronounce|pronunciation of|say|speak)\s+([a-zA-Z0-9_\-]+)/);
        if (match && match[1]) {
            targetWord = match[1].trim();
        }
        try {
            const allVocab = await dbService_1.dbService.vocab.getAll();
            const found = allVocab.find(v => v.word.toLowerCase() === targetWord.toLowerCase());
            if (found) {
                aiReply = `Here is how you pronounce **"${found.word}"**:
🔊 **Pronunciation Guide:** ${found.pronunciation}
🗣️ **Sound Guide:** Try saying it slowly: *"${found.word.toUpperCase()}"*.
💡 **Hint:** Tap the Speaker icon 🔊 on this message to hear it spoken aloud!`;
            }
            else {
                aiReply = `To pronounce **"${targetWord}"** correctly, split it into parts and speak each part slowly.
For example, for **"Excuse Me"** say: *ik-SKYOOS mee* (/ɪkˈskjuːz miː/).
Click the Speaker button to hear me say it!`;
            }
        }
        catch (e) {
            aiReply = `To pronounce it correctly, say: *"${targetWord}"*. Tap the Speaker button to hear it aloud!`;
        }
    }
    else if (userText.includes('teach') || userText.includes('lesson') || userText.includes('today')) {
        // 4. Teach Today's Lesson Request
        if (dayContent) {
            aiReply = `Welcome to **Day ${currentDayNum} Lesson: ${dayContent.grammar.conceptName}** 📚

💡 **Daily Concept:**
${dayContent.grammar.explanation}

📝 **Example Phrases:**
${dayContent.grammar.examples.map((ex) => `• ${ex}`).join('\n')}

Let's do a quick quiz!
👉 **Question:** *${dayContent.grammar.interactiveQuiz[0].question}*
Reply to me with your answer option!`;
        }
        else {
            aiReply = `Let's learn basic greetings! We say **"Hello"** to start, and **"Goodbye"** when leaving.
Would you like to practice? Ask me: "What does Hello mean?"`;
        }
    }
    else if (userText.includes('talk') || userText.includes('simple english') || userText.includes('chat')) {
        // 5. Talk in simple English request
        aiReply = `Hello! I would love to talk to you in simple English.
Let's start! How was your day? Tell me in a simple sentence, like: "My day was good" or "I am happy today". 😊`;
    }
    else {
        // 6. Generic response listing possibilities
        aiReply = `Hello! I am your AI English Teacher. I can help you learn English from scratch. 

You can ask me to do things like:
• "What does Welcome mean?" 📖
• "Correct my sentence: She don't like tea" ✍️
• "How do I pronounce Hello?" 🔊
• "Teach me today's lesson" 📚
• "Talk to me in simple English" 💬

Tell me, what would you like to practice first? 😊`;
    }
    // Record progress XP for chatting
    try {
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
        const xpGained = 10;
        await dbService_1.dbService.progress.upsert(userId, todayStr, { xpEarned: progress.xpEarned + xpGained });
        // Update user stats
        const user = await dbService_1.dbService.users.findById(userId);
        if (user) {
            await dbService_1.dbService.users.update(userId, { xp: (user.xp ?? 0) + xpGained });
        }
        res.json({
            reply: aiReply,
            suggestions,
            difficultWords,
            xpGained
        });
    }
    catch (error) {
        console.error('AI chat progress tracking error:', error);
        res.json({
            reply: aiReply,
            suggestions,
            difficultWords,
            xpGained: 0
        });
    }
});
exports.default = router;
