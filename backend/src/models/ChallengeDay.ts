import mongoose, { Schema, Document } from 'mongoose';
import { IVocab } from './Vocab';

export interface IChallengeGrammar {
  conceptName: string;
  explanation: string;
  examples: string[];
  interactiveQuiz: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }[];
}

export interface IChallengeSpeaking {
  prompt: string;
  sentencesToRead: string[];
  helperVocabulary: string[];
}

export interface IChallengeListening {
  audioPrompt: string;
  transcript: string;
  fillInBlanks: {
    question: string;
    answer: string;
  }[];
  multipleChoice: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export interface IChallengeWriting {
  prompt: string;
  placeholder: string;
  suggestedVocabulary: string[];
}

export interface IChallengeQuizQuestion {
  id: string;
  skillType: 'vocab' | 'grammar' | 'listening' | 'reading' | 'speaking';
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface IChallengeDay {
  _id: string;
  dayNumber: number; // 1 to 15
  vocabulary: Omit<IVocab, '_id' | 'createdAt'>[]; // 10 Words
  grammar: IChallengeGrammar;
  speaking: IChallengeSpeaking;
  listening: IChallengeListening;
  writing: IChallengeWriting;
  quiz: IChallengeQuizQuestion[]; // 20 Questions
  createdAt: string;
}

export interface IChallengeDayDoc extends Document, Omit<IChallengeDay, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const ChallengeDaySchema = new Schema<any>({
  dayNumber: { type: Number, required: true, unique: true, index: true },
  vocabulary: { type: [Schema.Types.Mixed], default: [] },
  grammar: {
    conceptName: { type: String, required: true },
    explanation: { type: String, required: true },
    examples: { type: [String], default: [] },
    interactiveQuiz: { type: [Schema.Types.Mixed], default: [] }
  },
  speaking: {
    prompt: { type: String, required: true },
    sentencesToRead: { type: [String], default: [] },
    helperVocabulary: { type: [String], default: [] }
  },
  listening: {
    audioPrompt: { type: String, required: true },
    transcript: { type: String, required: true },
    fillInBlanks: { type: [Schema.Types.Mixed], default: [] },
    multipleChoice: { type: [Schema.Types.Mixed], default: [] }
  },
  writing: {
    prompt: { type: String, required: true },
    placeholder: { type: String, required: true },
    suggestedVocabulary: { type: [String], default: [] }
  },
  quiz: { type: [Schema.Types.Mixed], default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

export default mongoose.models.ChallengeDay || mongoose.model<IChallengeDayDoc>('ChallengeDay', ChallengeDaySchema);
