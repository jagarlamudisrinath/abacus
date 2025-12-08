const API_BASE = process.env.REACT_APP_API_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

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
  completedAt: string;
}

export interface ProgressStats {
  totalSessions: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpent: number;
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

export interface ActivityDay {
  date: string;
  sessions: number;
  questions: number;
}

export interface WeekStats {
  sessions: number;
  questions: number;
  correct: number;
  accuracy: number;
  timeSpent: number;
  averageScore: number;
}

export interface ComparisonData {
  thisWeek: WeekStats;
  lastWeek: WeekStats;
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
  lastPracticeDate: string | null;
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

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/progress/dashboard`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return response.json();
}

export async function fetchStats(): Promise<ProgressStats> {
  const response = await fetch(`${API_BASE}/progress/stats`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}

export async function fetchSessions(
  limit: number = 20,
  offset: number = 0
): Promise<{ sessions: SessionSummary[]; total: number }> {
  const response = await fetch(`${API_BASE}/progress/sessions?limit=${limit}&offset=${offset}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }

  return response.json();
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const response = await fetch(`${API_BASE}/progress/sessions/${sessionId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session details');
  }

  return response.json();
}

export async function fetchTrends(days: number = 30): Promise<{ scoreTrend: TrendDataPoint[] }> {
  const response = await fetch(`${API_BASE}/progress/trends?days=${days}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trends');
  }

  return response.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/progress/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}

export async function fetchActivity(days: number = 84): Promise<{ activity: ActivityDay[] }> {
  const response = await fetch(`${API_BASE}/progress/activity?days=${days}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activity data');
  }

  return response.json();
}

export async function fetchComparison(): Promise<ComparisonData> {
  const response = await fetch(`${API_BASE}/progress/comparison`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comparison data');
  }

  return response.json();
}

// Paper Analytics types
export interface PaperAnalytics {
  practiceSheetId: string;
  practiceSheetName: string;
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averageTimeTaken: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  trend: 'improving' | 'declining' | 'stable';
  sessions: PaperSessionSummary[];
  scoreTrend: Array<{ date: string; score: number }>;
}

export interface PaperSessionSummary {
  sessionId: string;
  completedAt: string;
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  totalQuestions: number;
  timeTaken: number;
  comparedToAverage: 'above' | 'below' | 'equal';
}

export interface AttemptedPaper {
  practiceSheetId: string;
  practiceSheetName: string;
  sessionCount: number;
  lastAttempted: string;
  averageScore: number;
}

export async function fetchAttemptedPapers(): Promise<AttemptedPaper[]> {
  const response = await fetch(`${API_BASE}/progress/attempted-papers`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attempted papers');
  }

  return response.json();
}

export async function fetchPaperAnalytics(
  practiceSheetId: string,
  range: 'week' | 'month' | 'all' = 'all'
): Promise<PaperAnalytics> {
  const response = await fetch(
    `${API_BASE}/progress/paper-analytics/${encodeURIComponent(practiceSheetId)}?range=${range}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch paper analytics');
  }

  return response.json();
}
