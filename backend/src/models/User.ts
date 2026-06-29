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
  // Legacy optional fields for backward compatibility
  xp?: number;
  level?: number;
  favorites?: string[];
  completedLessons?: string[];
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
  { timestamps: false, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// Virtuals for legacy fields
UserSchema.virtual('xp')
  .get(function(this: any) {
    return this.levelProgress[this.currentLevelMode]?.xp ?? 0;
  })
  .set(function(this: any, value: number) {
    if (!this.levelProgress) this.levelProgress = {};
    if (!this.levelProgress[this.currentLevelMode]) this.levelProgress[this.currentLevelMode] = {};
    this.levelProgress[this.currentLevelMode].xp = value;
  });

UserSchema.virtual('level')
  .get(function(this: any) {
    return this.levelProgress[this.currentLevelMode]?.level ?? 1;
  })
  .set(function(this: any, value: number) {
    if (!this.levelProgress) this.levelProgress = {};
    if (!this.levelProgress[this.currentLevelMode]) this.levelProgress[this.currentLevelMode] = {};
    this.levelProgress[this.currentLevelMode].level = value;
  });

UserSchema.virtual('favorites')
  .get(function(this: any) {
    return this.levelProgress[this.currentLevelMode]?.favorites ?? [];
  })
  .set(function(this: any, value: any[]) {
    if (!this.levelProgress) this.levelProgress = {};
    if (!this.levelProgress[this.currentLevelMode]) this.levelProgress[this.currentLevelMode] = {};
    this.levelProgress[this.currentLevelMode].favorites = value;
  });

UserSchema.virtual('completedLessons')
  .get(function(this: any) {
    return this.levelProgress[this.currentLevelMode]?.completedLessons ?? [];
  })
  .set(function(this: any, value: any[]) {
    if (!this.levelProgress) this.levelProgress = {};
    if (!this.levelProgress[this.currentLevelMode]) this.levelProgress[this.currentLevelMode] = {};
    this.levelProgress[this.currentLevelMode].completedLessons = value;
  });

export default mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
