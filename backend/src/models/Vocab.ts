import mongoose, { Schema, Document } from 'mongoose';

export interface IVocab {
  _id: string;
  word: string;
  level: 'beginner' | 'intermediate' | 'professional';
  pronunciation: string;
  hindiMeaning: string;
  englishMeaning: string;
  partOfSpeech: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentences: string[];
  commonMistakes: string;
  memoryTrick: string;
  realLifeUsage: string;
  easyExplanation: string;
  audioUrl?: string;
  createdAt: string;
}

export interface IVocabDoc extends Document, Omit<IVocab, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const VocabSchema: Schema = new Schema(
  {
    word: { type: String, required: true, unique: true, index: true },
    level: { type: String, required: true, enum: ['beginner', 'intermediate', 'professional'], default: 'beginner', index: true },
    pronunciation: { type: String, required: true },
    hindiMeaning: { type: String, required: true },
    englishMeaning: { type: String, required: true },
    partOfSpeech: { type: String, required: true },
    synonyms: { type: [String], default: [] },
    antonyms: { type: [String], default: [] },
    exampleSentences: { type: [String], default: [] },
    commonMistakes: { type: String, default: '' },
    memoryTrick: { type: String, default: '' },
    realLifeUsage: { type: String, default: '' },
    easyExplanation: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: false }
);

export default mongoose.models.Vocab || mongoose.model<IVocabDoc>('Vocab', VocabSchema);
