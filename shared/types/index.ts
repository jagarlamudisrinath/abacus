// Test Types
export type TestMode = 'practice' | 'test';
export type TestStatus = 'not_started' | 'in_progress' | 'completed';
export type SectionType = 'addition_subtraction' | 'multiplication' | 'extras';

export interface Test {
  id: string;
  name: string;
  mode: TestMode;
  difficulty: string;
  sections: Section[];
  totalQuestions: number;
  timeLimit: number | null; // seconds, null for practice
  createdAt: Date;
  status: TestStatus;
}

export interface Section {
  id: string;
  name: string;
  type: SectionType;
  questions: Question[];
  isLocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
  questionCount: number;
}

export interface Question {
  id: string;
  sectionId: string;
  questionNumber: number; // Global number (1-200)
  expression: string;
  correctAnswer: number;
  isBookmarked: boolean;
}

export interface Response {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  answeredAt: Date | null;
}

export interface UserSettings {
  fontSize: 'small' | 'default' | 'large';
  theme: 'light' | 'dark' | 'system';
  candidateName: string;
}

export interface TestResult {
  testId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number; // percentage
  timeTaken: number; // seconds
  sectionResults: SectionResult[];
  completedAt: Date;
}

export interface SectionResult {
  sectionId: string;
  sectionName: string;
  sectionType: SectionType;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number; // percentage
}

// API Request/Response types
export interface GenerateTestRequest {
  mode: TestMode;
  difficulty: string;
  candidateName: string;
  questionsPerSection?: number;
}

export interface GenerateTestResponse {
  test: Test;
}

export interface SaveProgressRequest {
  testId: string;
  responses: Record<string, Response>;
  currentSectionIndex: number;
  currentQuestionIndex: number;
}

export interface SubmitTestRequest {
  testId: string;
  responses: Record<string, Response>;
  timeTaken: number;
}

// Difficulty configuration
export interface DifficultyConfig {
  addSub: {
    minValue: number;
    maxValue: number;
    minOperands: number;
    maxOperands: number;
  };
  mult: {
    minMultiplier: number;
    maxMultiplier: number;
    minMultiplicand: number;
    maxMultiplicand: number;
  };
  extras: {
    minDivisor: number;
    maxDivisor: number;
    minQuotient: number;
    maxQuotient: number;
  };
}
