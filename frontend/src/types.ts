export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'job_seeker' | 'professional' | 'admin';
  xp: number;
  coins: number;
  streak: number;
  level: number;
  badges: string[];
  favorites: string[]; // vocab word IDs
  completedLessons: string[]; // lesson IDs
}

export interface Word {
  _id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  englishMeaning: string;
  hindiMeaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentences: string[];
  commonMistakes: string;
  memoryTrick: string;
  realLifeUsage: string;
  audioUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface Lesson {
  _id: string;
  type: 'grammar' | 'reading' | 'listening' | 'interview';
  title: string;
  category: string;
  content: string;
  audioUrl?: string;
  metadata: {
    questions?: QuizQuestion[];
    suggestedAnswers?: string[];
    tips?: string[];
  };
}

export interface WritingRecord {
  prompt: string;
  submission: string;
  score: number;
  feedback: string[];
  submittedAt: string;
}

export interface ProgressSummary {
  date: string;
  vocabWordsLearned: string[];
  speakingTime: number; // seconds
  readingTime: number; // seconds
  listeningTime: number; // seconds
  writingSubmissions: WritingRecord[];
  grammarQuizzesCompleted: {
    lessonId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
  }[];
  dailyChallengeCompleted: boolean;
  xpEarned: number;
  coinsEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  role: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}
