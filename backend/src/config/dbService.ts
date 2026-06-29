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
      const result = await (User as any).findOne({ email }).lean({ virtuals: true });
      return result as IUser | null;
    },

    async findById(id: string): Promise<IUser | null> {
      if (useLocalDB) {
        const users = localDb.getCollection<IUser>('users');
        return users.find(u => u._id === id) || null;
      }
      const result = await (User as any).findById(id).lean({ virtuals: true });
      return result as IUser | null;
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
        localDb.saveCollection('users', users);
        return newUser;
      }
      const u = new User(userData);
      const saved = await u.save();
      return saved.toObject() as unknown as IUser;
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
      const result = await (User as any).findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
      return result as IUser | null;
    },

    async getAll(): Promise<IUser[]> {
      if (useLocalDB) {
        return localDb.getCollection<IUser>('users');
      }
      const result = await (User as any).find().lean();
      return result as IUser[];
    }
  },

  vocab: {
    async getAll(): Promise<IVocab[]> {
      if (useLocalDB) {
        return localDb.getCollection<IVocab>('vocabs');
      }
      const result = await (Vocab as any).find().lean();
      return result as IVocab[];
    },

    async findById(id: string): Promise<IVocab | null> {
      if (useLocalDB) {
        const vocabs = localDb.getCollection<IVocab>('vocabs');
        return vocabs.find(v => v._id === id) || null;
      }
      const result = await (Vocab as any).findById(id).lean();
      return result as IVocab | null;
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
          commonMistakes: vocabData.commonMistakes || '',
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
      return saved.toObject() as unknown as IVocab;
    },

    async delete(id: string): Promise<boolean> {
      if (useLocalDB) {
        const vocabs = localDb.getCollection<IVocab>('vocabs');
        const filtered = vocabs.filter(v => v._id !== id);
        if (filtered.length === vocabs.length) return false;
        localDb.saveCollection('vocabs', filtered);
        return true;
      }
      const result = await (Vocab as any).findByIdAndDelete(id);
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
      const result = await (Lesson as any).find(query).lean();
      return result as ILesson[];
    },

    async findById(id: string): Promise<ILesson | null> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        return lessons.find(l => l._id === id) || null;
      }
      const result = await (Lesson as any).findById(id).lean();
      return result as ILesson | null;
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
      return saved.toObject() as unknown as ILesson;
    },

    async delete(id: string): Promise<boolean> {
      if (useLocalDB) {
        const lessons = localDb.getCollection<ILesson>('lessons');
        const filtered = lessons.filter(l => l._id !== id);
        if (filtered.length === lessons.length) return false;
        localDb.saveCollection('lessons', filtered);
        return true;
      }
      const result = await (Lesson as any).findByIdAndDelete(id);
      return result !== null;
    }
  },

  progress: {
    async findByUserAndDate(userId: string, date: string): Promise<IProgress | null> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        return prog.find(p => p.userId === userId && p.date === date) || null;
      }
      const result = await (Progress as any).findOne({ userId, date }).lean();
      return result as IProgress | null;
    },

    async getHistory(userId: string): Promise<IProgress[]> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        return prog.filter(p => p.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
      }
      const result = await (Progress as any).find({ userId }).sort({ date: -1 }).lean();
      return result as IProgress[];
    },

    async upsert(userId: string, date: string, progressData: Partial<IProgress>): Promise<IProgress> {
      if (useLocalDB) {
        const prog = localDb.getCollection<IProgress>('progress');
        const idx = prog.findIndex(p => p.userId === userId && p.date === date);
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
      
      const updated = await (Progress as any).findOneAndUpdate(
        { userId, date },
        { $set: progressData },
        { new: true, upsert: true }
      ).lean();
      return updated as IProgress;
    }
  }
};
