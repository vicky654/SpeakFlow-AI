"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
const User_1 = __importDefault(require("../models/User"));
const Vocab_1 = __importDefault(require("../models/Vocab"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Progress_1 = __importDefault(require("../models/Progress"));
const ChallengeDay_1 = __importDefault(require("../models/ChallengeDay"));
const ChallengeProgress_1 = __importDefault(require("../models/ChallengeProgress"));
const db_1 = require("./db");
const localDb_1 = require("./localDb");
const mongoose_1 = __importDefault(require("mongoose"));
// Generate a mock unique string ID
function generateId() {
    return new mongoose_1.default.Types.ObjectId().toString();
}
exports.dbService = {
    users: {
        async findByEmail(email) {
            if (db_1.useLocalDB) {
                const users = localDb_1.localDb.getCollection('users');
                return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
            }
            const result = await User_1.default.findOne({ email }).lean({ virtuals: true });
            return result;
        },
        async findById(id) {
            if (db_1.useLocalDB) {
                const users = localDb_1.localDb.getCollection('users');
                return users.find(u => u._id === id) || null;
            }
            const result = await User_1.default.findById(id).lean({ virtuals: true });
            return result;
        },
        async create(userData) {
            if (db_1.useLocalDB) {
                const users = localDb_1.localDb.getCollection('users');
                const newUser = {
                    _id: generateId(),
                    name: userData.name || '',
                    email: userData.email || '',
                    passwordHash: userData.passwordHash || '',
                    role: userData.role || 'student',
                    coins: userData.coins ?? 0,
                    streak: userData.streak ?? 0,
                    badges: userData.badges ?? [],
                    currentLevelMode: userData.currentLevelMode || 'beginner',
                    levelProgress: userData.levelProgress || {
                        beginner: { xp: 0, level: 1, favorites: [], completedLessons: [] },
                        intermediate: { xp: 0, level: 1, favorites: [], completedLessons: [] },
                        professional: { xp: 0, level: 1, favorites: [], completedLessons: [] }
                    },
                    createdAt: new Date().toISOString(),
                    ...userData
                };
                users.push(newUser);
                localDb_1.localDb.saveCollection('users', users);
                return newUser;
            }
            const u = new User_1.default(userData);
            const saved = await u.save();
            return saved.toObject();
        },
        async update(id, updateData) {
            if (db_1.useLocalDB) {
                const users = localDb_1.localDb.getCollection('users');
                const idx = users.findIndex(u => u._id === id);
                if (idx === -1)
                    return null;
                users[idx] = { ...users[idx], ...updateData };
                localDb_1.localDb.saveCollection('users', users);
                return users[idx];
            }
            const result = await User_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
            return result;
        },
        async getAll() {
            if (db_1.useLocalDB) {
                return localDb_1.localDb.getCollection('users');
            }
            const result = await User_1.default.find().lean();
            return result;
        }
    },
    vocab: {
        async getAll() {
            if (db_1.useLocalDB) {
                return localDb_1.localDb.getCollection('vocabs');
            }
            const result = await Vocab_1.default.find().lean();
            return result;
        },
        async findById(id) {
            if (db_1.useLocalDB) {
                const vocabs = localDb_1.localDb.getCollection('vocabs');
                return vocabs.find(v => v._id === id) || null;
            }
            const result = await Vocab_1.default.findById(id).lean();
            return result;
        },
        async create(vocabData) {
            if (db_1.useLocalDB) {
                const vocabs = localDb_1.localDb.getCollection('vocabs');
                const newVocab = {
                    _id: generateId(),
                    word: vocabData.word || '',
                    level: vocabData.level || 'beginner',
                    pronunciation: vocabData.pronunciation || '',
                    hindiMeaning: vocabData.hindiMeaning || '',
                    englishMeaning: vocabData.englishMeaning || '',
                    partOfSpeech: vocabData.partOfSpeech || '',
                    synonyms: vocabData.synonyms || [],
                    antonyms: vocabData.antonyms || [],
                    exampleSentences: vocabData.exampleSentences || [],
                    commonMistakes: vocabData.commonMistakes || '',
                    memoryTrick: vocabData.memoryTrick || '',
                    realLifeUsage: vocabData.realLifeUsage || '',
                    audioUrl: vocabData.audioUrl || '',
                    createdAt: new Date().toISOString(),
                    ...vocabData
                };
                vocabs.push(newVocab);
                localDb_1.localDb.saveCollection('vocabs', vocabs);
                return newVocab;
            }
            const v = new Vocab_1.default(vocabData);
            const saved = await v.save();
            return saved.toObject();
        },
        async delete(id) {
            if (db_1.useLocalDB) {
                const vocabs = localDb_1.localDb.getCollection('vocabs');
                const filtered = vocabs.filter(v => v._id !== id);
                if (filtered.length === vocabs.length)
                    return false;
                localDb_1.localDb.saveCollection('vocabs', filtered);
                return true;
            }
            const result = await Vocab_1.default.findByIdAndDelete(id);
            return result !== null;
        }
    },
    lessons: {
        async getByType(type, level) {
            if (db_1.useLocalDB) {
                const lessons = localDb_1.localDb.getCollection('lessons');
                return lessons.filter(l => l.type === type && (!level || l.level === level));
            }
            const query = { type };
            if (level)
                query.level = level;
            const result = await Lesson_1.default.find(query).lean();
            return result;
        },
        async findById(id) {
            if (db_1.useLocalDB) {
                const lessons = localDb_1.localDb.getCollection('lessons');
                return lessons.find(l => l._id === id) || null;
            }
            const result = await Lesson_1.default.findById(id).lean();
            return result;
        },
        async create(lessonData) {
            if (db_1.useLocalDB) {
                const lessons = localDb_1.localDb.getCollection('lessons');
                const newLesson = {
                    _id: generateId(),
                    type: lessonData.type || 'grammar',
                    level: lessonData.level || 'beginner',
                    title: lessonData.title || '',
                    category: lessonData.category || '',
                    content: lessonData.content || '',
                    audioUrl: lessonData.audioUrl || '',
                    metadata: lessonData.metadata || {},
                    createdAt: new Date().toISOString(),
                    ...lessonData
                };
                lessons.push(newLesson);
                localDb_1.localDb.saveCollection('lessons', lessons);
                return newLesson;
            }
            const l = new Lesson_1.default(lessonData);
            const saved = await l.save();
            return saved.toObject();
        },
        async delete(id) {
            if (db_1.useLocalDB) {
                const lessons = localDb_1.localDb.getCollection('lessons');
                const filtered = lessons.filter(l => l._id !== id);
                if (filtered.length === lessons.length)
                    return false;
                localDb_1.localDb.saveCollection('lessons', filtered);
                return true;
            }
            const result = await Lesson_1.default.findByIdAndDelete(id);
            return result !== null;
        }
    },
    progress: {
        async findByUserAndDate(userId, date) {
            if (db_1.useLocalDB) {
                const prog = localDb_1.localDb.getCollection('progress');
                return prog.find(p => p.userId === userId && p.date === date) || null;
            }
            const result = await Progress_1.default.findOne({ userId, date }).lean();
            return result;
        },
        async getHistory(userId) {
            if (db_1.useLocalDB) {
                const prog = localDb_1.localDb.getCollection('progress');
                return prog.filter(p => p.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
            }
            const result = await Progress_1.default.find({ userId }).sort({ date: -1 }).lean();
            return result;
        },
        async upsert(userId, date, progressData) {
            if (db_1.useLocalDB) {
                const prog = localDb_1.localDb.getCollection('progress');
                const idx = prog.findIndex(p => p.userId === userId && p.date === date);
                if (idx === -1) {
                    const newProgress = {
                        _id: generateId(),
                        userId,
                        date,
                        vocabWordsLearned: [],
                        speakingTime: 0,
                        readingTime: 0,
                        listeningTime: 0,
                        writingSubmissions: [],
                        grammarQuizzesCompleted: [],
                        dailyChallengeCompleted: false,
                        xpEarned: 0,
                        coinsEarned: 0,
                        createdAt: new Date().toISOString(),
                        ...progressData
                    };
                    prog.push(newProgress);
                    localDb_1.localDb.saveCollection('progress', prog);
                    return newProgress;
                }
                else {
                    prog[idx] = { ...prog[idx], ...progressData };
                    localDb_1.localDb.saveCollection('progress', prog);
                    return prog[idx];
                }
            }
            const updated = await Progress_1.default.findOneAndUpdate({ userId, date }, { $set: progressData }, { new: true, upsert: true }).lean();
            return updated;
        }
    },
    challengeDays: {
        async findByDayNumber(dayNumber) {
            if (db_1.useLocalDB) {
                const days = localDb_1.localDb.getCollection('challengeDays');
                return days.find(d => d.dayNumber === dayNumber) || null;
            }
            const result = await ChallengeDay_1.default.findOne({ dayNumber }).lean();
            return result;
        },
        async create(dayData) {
            if (db_1.useLocalDB) {
                const days = localDb_1.localDb.getCollection('challengeDays');
                const newDay = {
                    _id: generateId(),
                    dayNumber: dayData.dayNumber || 1,
                    vocabulary: dayData.vocabulary || [],
                    grammar: dayData.grammar || { conceptName: '', explanation: '', examples: [], interactiveQuiz: [] },
                    speaking: dayData.speaking || { prompt: '', sentencesToRead: [], helperVocabulary: [] },
                    listening: dayData.listening || { audioPrompt: '', transcript: '', fillInBlanks: [], multipleChoice: [] },
                    writing: dayData.writing || { prompt: '', placeholder: '', suggestedVocabulary: [] },
                    quiz: dayData.quiz || [],
                    createdAt: new Date().toISOString(),
                    ...dayData
                };
                days.push(newDay);
                localDb_1.localDb.saveCollection('challengeDays', days);
                return newDay;
            }
            const d = new ChallengeDay_1.default(dayData);
            const saved = await d.save();
            return saved.toObject();
        },
        async getAll() {
            if (db_1.useLocalDB) {
                return localDb_1.localDb.getCollection('challengeDays');
            }
            const result = await ChallengeDay_1.default.find().sort({ dayNumber: 1 }).lean();
            return result;
        },
        async update(dayNumber, dayData) {
            if (db_1.useLocalDB) {
                const days = localDb_1.localDb.getCollection('challengeDays');
                const idx = days.findIndex(d => d.dayNumber === dayNumber);
                if (idx === -1)
                    return null;
                days[idx] = { ...days[idx], ...dayData };
                localDb_1.localDb.saveCollection('challengeDays', days);
                return days[idx];
            }
            const result = await ChallengeDay_1.default.findOneAndUpdate({ dayNumber }, { $set: dayData }, { new: true }).lean();
            return result;
        }
    },
    challengeProgress: {
        async findByUserId(userId) {
            if (db_1.useLocalDB) {
                const progress = localDb_1.localDb.getCollection('challengeProgress');
                return progress.find(p => p.userId === userId) || null;
            }
            const result = await ChallengeProgress_1.default.findOne({ userId }).lean();
            return result;
        },
        async upsert(userId, progressData) {
            if (db_1.useLocalDB) {
                const progress = localDb_1.localDb.getCollection('challengeProgress');
                const idx = progress.findIndex(p => p.userId === userId);
                if (idx === -1) {
                    const newProgress = {
                        _id: generateId(),
                        userId,
                        currentDay: 1,
                        completedDays: [],
                        dailyStatus: {
                            1: { status: 'current' }
                        },
                        answersSaved: {},
                        xpEarned: 0,
                        coinsEarned: 0,
                        longestStreak: 0,
                        luckySpinsLeftToday: 1,
                        updatedAt: new Date().toISOString(),
                        ...progressData
                    };
                    // Initialize locked days
                    for (let d = 2; d <= 15; d++) {
                        newProgress.dailyStatus[d] = { status: 'locked' };
                    }
                    progress.push(newProgress);
                    localDb_1.localDb.saveCollection('challengeProgress', progress);
                    return newProgress;
                }
                else {
                    progress[idx] = { ...progress[idx], ...progressData, updatedAt: new Date().toISOString() };
                    localDb_1.localDb.saveCollection('challengeProgress', progress);
                    return progress[idx];
                }
            }
            // Initialize default dailyStatus object structure for Mongoose
            const defaultStatus = { 1: { status: 'current' } };
            for (let d = 2; d <= 15; d++) {
                defaultStatus[d] = { status: 'locked' };
            }
            const result = await ChallengeProgress_1.default.findOneAndUpdate({ userId }, {
                $setOnInsert: { dailyStatus: defaultStatus },
                $set: progressData
            }, { new: true, upsert: true }).lean();
            return result;
        }
    }
};
