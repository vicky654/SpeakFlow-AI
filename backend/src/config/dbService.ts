import User, { IUser } from '../models/User';
import Vocab, { IVocab } from '../models/Vocab';
import Lesson, { ILesson } from '../models/Lesson';
import Progress, { IProgress } from '../models/Progress';
import { useLocalDB } from './db';
import { localDb } from './localDb';
import mongoose from 'mongoose';

// Generate a mock unique string ID
function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

export const dbService = {
  users: {
    async findByEmail(email: string): Promise<IUser | null> {
      if (useLocalDB) {
        const users = localDb.getCollection<IUser>('users');
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
      }
      return User.findOne({ email }).lean() as any;
    },

    async findById(id: string): Promise<IUser | null> {
      if (useLocalDB) {
        const users = localDb.getCollection<IUser>('users');
        return users.find(u => u._id === id) || null;
      }
      return User.findById(id).lean() as any;
    },

    async create(userData: Partial<IUser>): Promise<IUser> {
      if (useLocalDB) {
        const users = localDb.getCollection<IUser>('users');
        const newUser: IUser = {
          _id: generateId(),
          name: userData.name || '',
          email: userData.email || '',
          passwordHash: userData.passwordHash || '',
          role: userData.role || 'student',
          xp: 0,
          coins: 0,
          streak: 0,
          level: 1,
          badges: [],
          favorites: [],
          completedLessons: [],
          createdAt: new Date().toISOString(),
          ...userData
        };
        users.push(newUser);
        localDb.saveCollection('users', users);
        return newUser;
      }
      const u = new User(userData);
      const saved = await u.save();
      return saved.toObject();
    },

    async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
      if (useLocalDB) {
        const users = localDb.getCollection<IUser>('users');
        const idx = users.findIndex(u => u._id === id);
        if (idx === -1) return null;
        users[idx] = { ...users[idx], ...updateData };
        localDb.saveCollection('users', users);
        return users[idx];
      }
      return User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean() as any;
    },

    async getAll(): Promise<IUser[]> {
      if (useLocalDB) {
        return localDb.getCollection<IUser>('users');
      }
      return User.find().lean() as any;
    }
  },

  vocab: {
    async getAll(): Promise<IVocab[]> {
      if (useLocalDB) {
        return localDb.getCollection<IVocab>('vocabs');
      }
      return Vocab.find().lean() as any;
    },

    async findById(id: string): Promise<IVocab | null> {
      if (useLocalDB) {
        const vocabs = localDb.getCollection<IVocab>('vocabs');
        return vocabs.find(v => v._id === id) || null;
      }
      return Vocab.findById(id).lean() as any;
    },

    async create(vocabData: Partial<IVocab>): Promise<IVocab> {
      if (useLocalDB) {
        const vocabs = localDb.getCollection<IVocab>('vocabs');
        const newVocab: IVocab = {
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
          commonMistakes: vocabForm => vocabData.commonMistakes || '',
          memoryTrick: vocabData.memoryTrick || '',
          realLifeUsage: vocabData.realLifeUsage || '',
          audioUrl: vocabData.audioUrl || '',
          createdAt: new Date().toISOString(),
          ...vocabData
        };
        vocabs.push(newVocab);
        localDb.saveCollection('vocabs', vocabs);
        return newVocab;
      }
      const v = new Vocab(vocabData);
      const saved = await v.save();
      return saved.toObject();
    },

    async delete(id: string): Promise<boolean> {
      if (useLocalDB) {
        const vocabs = localDb.getCollection<IVocab>('vocabs');
        const filtered = vocabs.filter(v => v._id !== id);
        if (filtered.length === vocabs.length) return false;
        localDb.saveCollection('vocabs', filtered);
        return true;
      }
      const result = await Vocab.findByIdAndDelete(id);
      return result !== null;
    }
  },

  lessons: {
    async getByType(type: string, level?: string): Promise<ILesson[]> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        return lessons.filter(l => l.type === type && (!level || l.level === level));
      }
      const query: any = { type };
      if (level) query.level = level;
      return Lesson.find(query).lean() as any;
    },

    async findById(id: string): Promise<ILesson | null> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        return lessons.find(l => l._id === id) || null;
      }
      return Lesson.findById(id).lean() as any;
    },

    async create(lessonData: Partial<ILesson>): Promise<ILesson> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        const newLesson: ILesson = {
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
        localDb.saveCollection('lessons', lessons);
        return newLesson;
      }
      const l = new Lesson(lessonData);
      const saved = await l.save();
      return saved.toObject();
    },

    async delete(id: string): Promise<boolean> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        const filtered = lessons.filter(l => l._id !== id);
        if (filtered.length === lessons.length) return false;
        localDb.saveCollection('lessons', filtered);
        return true;
      }
      const result = await Lesson.findByIdAndDelete(id);
      return result !== null;
    }
  },

  progress: {
    async findByUserAndDate(userId: string, date: string): Promise<IProgress | null> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        return prog.find(p => p.userId === userId && p.date === date) || null;
      }
      return Progress.findOne({ userId, date }).lean() as any;
    },

    async getHistory(userId: string): Promise<IProgress[]> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        return prog.filter(p => p.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
      }
      return Progress.find({ userId }).sort({ date: -1 }).lean() as any;
    },

    async upsert(userId: string, date: string, progressData: Partial<IProgress>): Promise<IProgress> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        let idx = prog.findIndex(p => p.userId === userId && p.date === date);
        if (idx === -1) {
          const newProgress: IProgress = {
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
          localDb.saveCollection('progress', prog);
          return newProgress;
        } else {
          prog[idx] = { ...prog[idx], ...progressData };
          localDb.saveCollection('progress', prog);
          return prog[idx];
        }
      }
      
      const updated = await Progress.findOneAndUpdate(
        { userId, date },
        { $set: progressData },
        { new: true, upsert: true }
      ).lean();
      return updated as any;
    }
  }
};
