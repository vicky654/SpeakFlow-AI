import mongoose, { Schema, Document } from 'mongoose';

export interface IDayStatus {
  status: 'locked' | 'completed' | 'current' | 'missed';
  completedAt?: string;
  quizScore?: number;
}

export interface IChallengeProgress {
  _id: string;
  userId: string;
  currentDay: number; // defaults to 1, max 15
  completedDays: number[]; // e.g. [1, 2]
  dailyStatus: Record<number, IDayStatus>; // key represents dayNumber (1-15)
  answersSaved: Record<number, any>; // stores answers per day drill
  xpEarned: number;
  coinsEarned: number;
  longestStreak: number;
  lastClaimedDailyChest?: string; // YYYY-MM-DD
  luckySpinsLeftToday: number;
  updatedAt: string;
}

export interface IChallengeProgressDoc extends Document, Omit<IChallengeProgress, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const ChallengeProgressSchema = new Schema<any>({
  userId: { type: String, required: true, unique: true, index: true },
  currentDay: { type: Number, default: 1 },
  completedDays: { type: [Number], default: [] },
  dailyStatus: { type: Schema.Types.Mixed, default: () => ({}) },
  answersSaved: { type: Schema.Types.Mixed, default: () => ({}) },
  xpEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastClaimedDailyChest: { type: String },
  luckySpinsLeftToday: { type: Number, default: 1 },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

export default mongoose.models.ChallengeProgress || mongoose.model<IChallengeProgressDoc>('ChallengeProgress', ChallengeProgressSchema);
