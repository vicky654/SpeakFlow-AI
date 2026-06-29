import mongoose, { Schema, Document } from 'mongoose';

export interface IWritingSubmission {
  prompt: string;
  submission: string;
  score: number;
  feedback: string[];
  submittedAt: string;
}

export interface IGrammarQuizRecord {
  lessonId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface IProgress {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  vocabWordsLearned: string[]; // IDs of vocab learned on this date
  speakingTime: number; // in seconds
  readingTime: number; // in seconds
  listeningTime: number; // in seconds
  writingSubmissions: IWritingSubmission[];
  grammarQuizzesCompleted: IGrammarQuizRecord[];
  dailyChallengeCompleted: boolean;
  xpEarned: number;
  coinsEarned: number;
  createdAt: string;
}

export interface IProgressDoc extends Document, Omit<IProgress, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const ProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    vocabWordsLearned: { type: [String], default: [] },
    speakingTime: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    listeningTime: { type: Number, default: 0 },
    writingSubmissions: [
      {
        prompt: { type: String, required: true },
        submission: { type: String, required: true },
        score: { type: Number, default: 0 },
        feedback: [{ type: String }],
        submittedAt: { type: String, default: () => new Date().toISOString() }
      }
    ],
    grammarQuizzesCompleted: [
      {
        lessonId: { type: String, required: true },
        score: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
        completedAt: { type: String, default: () => new Date().toISOString() }
      }
    ],
    dailyChallengeCompleted: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
    coinsEarned: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: false }
);

export default mongoose.models.Progress || mongoose.model<IProgressDoc>('Progress', ProgressSchema);
