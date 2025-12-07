export interface SessionSummary {
  id: string;
  practiceSheetId: string;
  practiceSheetName: string;
  mode: 'practice' | 'test';
  score: number;
  correct: number;
  incorrect: number;
  total: number;
  attempted: number;
  timeTaken: number;
  completedAt: Date;
}

export interface ProgressStats {
  totalSessions: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpent: number; // seconds
  averageScore: number;
  averageTimePerSession: number;
  bestScore: number;
  recentSessions: SessionSummary[];
}

export interface TrendDataPoint {
  date: string;
  score: number;
  accuracy: number;
  questionsAttempted: number;
}

export interface WeeklyActivity {
  day: string;
  sessions: number;
  questions: number;
}

export interface WeakAreaAnalysis {
  practiceSheetId: string;
  practiceSheetName: string;
  sessionsAttempted: number;
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface IntervalTrendAnalysis {
  intervalNumber: number;
  averageQuestionsAttempted: number;
  averageAccuracy: number;
  averageTimePerQuestion: number;
}

export interface DashboardData {
  stats: ProgressStats;
  scoreTrend: TrendDataPoint[];
  weeklyActivity: WeeklyActivity[];
  weakAreas: WeakAreaAnalysis[];
  intervalTrends: IntervalTrendAnalysis[];
  streakDays: number;
  lastPracticeDate: Date | null;
}

export interface SessionDetail extends SessionSummary {
  sectionResults: Array<{
    sectionId: string;
    sectionName: string;
    sectionType: string;
    total: number;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  intervals: Array<{
    intervalNumber: number;
    startTime: number;
    endTime: number;
    questionsAttempted: number;
    correct: number;
    incorrect: number;
    avgTimePerQuestion: number;
  }>;
  responses: Array<{
    questionNumber: number;
    expression: string;
    correctAnswer: number;
    userAnswer: string | null;
    isCorrect: boolean | null;
    timeSpent: number | null;
  }>;
}
