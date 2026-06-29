import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  _id: string;
  type: 'grammar' | 'reading' | 'listening' | 'interview';
  level: 'beginner' | 'intermediate' | 'professional';
  title: string;
  category: string; // e.g. 'Tenses', 'Business Meeting', 'Short Stories', 'HR Interview'
  content: string; // Markdown or text content
  audioUrl?: string; // Optional for listening audio files
  metadata: {
    questions?: {
      id: string;
      question: string;
      options: string[];
      answer: string; // Correct option text or index
      explanation?: string;
    }[];
    suggestedAnswers?: string[]; // Useful for interview preparation
    tips?: string[];
  };
  createdAt: string;
}

export interface ILessonDoc extends Document, Omit<ILesson, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const LessonSchema: Schema = new Schema(
  {
    type: { type: String, required: true, enum: ['grammar', 'reading', 'listening', 'interview'], index: true },
    level: { type: String, required: true, enum: ['beginner', 'intermediate', 'professional'], default: 'beginner', index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    audioUrl: { type: String, default: '' },
    metadata: {
      questions: [
        {
          id: { type: String },
          question: { type: String },
          options: [{ type: String }],
          answer: { type: String },
          explanation: { type: String }
        }
      ],
      suggestedAnswers: [{ type: String }],
      tips: [{ type: String }]
    },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: false }
);

export default mongoose.models.Lesson || mongoose.model<ILessonDoc>('Lesson', LessonSchema);
