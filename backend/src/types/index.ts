// Test Types
export type TestMode = 'practice' | 'test';
export type TestStatus = 'not_started' | 'in_progress' | 'completed';
export type SectionType = 'addition_subtraction' | 'multiplication' | 'extras';

export interface Test {
  id: string;
  name: string;
  mode: TestMode;
  practiceSheetId: string;  // Changed from difficulty
  sections: Section[];
  totalQuestions: number;
  timeLimit: number | null;
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
  progress: number;
  questionCount: number;
}

export interface Question {
  id: string;
  sectionId: string;
  questionNumber: number;
  expression: string;
  correctAnswer: number;
  isBookmarked: boolean;
}

export interface Response {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  answeredAt: Date | null;
  timeSpent: number | null; // Time spent in seconds
}

export interface UserSettings {
  fontSize: 'small' | 'default' | 'large';
  theme: 'light' | 'dark' | 'system';
  candidateName: string;
}

export interface IntervalStats {
  intervalNumber: number;
  startTime: number;
  endTime: number;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number;
}

export interface TestResult {
  testId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  timeTaken: number;
  sectionResults: SectionResult[];
  completedAt: Date;
  intervals?: IntervalStats[];
}

export interface SectionResult {
  sectionId: string;
  sectionName: string;
  sectionType: SectionType;
  total: number;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface GenerateTestRequest {
  mode: TestMode;
  practiceSheetId: string;  // Changed from difficulty
  candidateName: string;
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
  intervals?: IntervalStats[];
}

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
    // For simple multiplication in C1 extras
    minMultiplier?: number;
    maxMultiplier?: number;
    minMultiplicand?: number;
    maxMultiplicand?: number;
  };
}
