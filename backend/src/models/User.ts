import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLevelProgress {
  xp: number;
  level: number;
  favorites: string[];
  completedLessons: string[];
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'job_seeker' | 'professional' | 'admin';
  coins: number;
  streak: number;
  lastActive?: string; // YYYY-MM-DD
  badges: string[];
  currentLevelMode: 'beginner' | 'intermediate' | 'professional';
  levelProgress: {
    beginner: IUserLevelProgress;
    intermediate: IUserLevelProgress;
    professional: IUserLevelProgress;
  };
  createdAt: string;
}

export interface IUserDoc extends Document, Omit<IUser, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const LevelProgressSchema = new Schema({
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  favorites: { type: [String], default: [] },
  completedLessons: { type: [String], default: [] }
}, { _id: false });

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'job_seeker', 'professional', 'admin'], default: 'student' },
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: String },
    badges: { type: [String], default: [] },
    currentLevelMode: { type: String, enum: ['beginner', 'intermediate', 'professional'], default: 'beginner' },
    levelProgress: {
      beginner: { type: LevelProgressSchema, default: () => ({}) },
      intermediate: { type: LevelProgressSchema, default: () => ({}) },
      professional: { type: LevelProgressSchema, default: () => ({}) }
    },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: false }
);

export default mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
