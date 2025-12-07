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

export interface PracticeSheet {
  id: string;
  name: string;
  questionCount: number;
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
  startedAt: Date | null;
  answeredAt: Date | null;
  timeSpent: number | null; // Time spent in seconds
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
  score: number;
  timeTaken: number;
  sectionResults: SectionResult[];
  completedAt: Date;
  intervals?: IntervalStats[];  // Optional for backward compatibility
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

export interface IntervalStats {
  intervalNumber: number;
  startTime: number;        // seconds when interval started
  endTime: number;          // seconds when interval ended
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number;
}

// Test State for Context
export interface TestState {
  test: Test | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  responses: Record<string, Response>;
  startTime: Date | null;
  timeRemaining: number | null;
  elapsedTime: number;
  lastSavedAt: Date | null;
  isLoading: boolean;
  error: string | null;
  // Interval tracking for 7-minute checkpoints
  isPaused: boolean;
  intervals: IntervalStats[];
  currentIntervalStart: number;
  questionsAtIntervalStart: number;
  correctAtIntervalStart: number;
  incorrectAtIntervalStart: number;
}

export type TestAction =
  | { type: 'SET_TEST'; payload: Test }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'GO_TO_QUESTION'; payload: { sectionIndex: number; questionIndex: number } }
  | { type: 'SET_RESPONSE'; payload: { questionId: string; answer: string } }
  | { type: 'START_QUESTION'; payload: string }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'UPDATE_ELAPSED_TIME' }
  | { type: 'SET_SAVED'; payload: Date }
  | { type: 'COMPLETE_SECTION'; payload: number }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<TestState> }
  | { type: 'PAUSE_TEST' }
  | { type: 'RESUME_TEST' }
  | { type: 'SAVE_INTERVAL'; payload: IntervalStats }
  | { type: 'START_NEW_INTERVAL'; payload: { attempted: number; correct: number; incorrect: number } };
