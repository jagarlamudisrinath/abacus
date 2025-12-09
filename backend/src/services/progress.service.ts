import { query } from '../db';
import * as sessionRepo from '../repositories/session.repository';
import {
  DashboardData,
  ProgressStats,
  TrendDataPoint,
  WeeklyActivity,
  WeakAreaAnalysis,
  IntervalTrendAnalysis,
  SessionSummary,
  SessionDetail,
  ActivityDay,
  WeekStats,
  ComparisonData,
  PaperAnalytics,
  PaperSessionSummary,
  AttemptedPaper,
} from '../types/progress.types';

export async function getDashboardData(studentId: string): Promise<DashboardData> {
  const [stats, scoreTrend, weeklyActivity, weakAreas, intervalTrends, streakInfo] =
    await Promise.all([
      getProgressStats(studentId),
      getScoreTrend(studentId, 30),
      getWeeklyActivity(studentId),
      getWeakAreas(studentId),
      getIntervalTrends(studentId),
      getStreakInfo(studentId),
    ]);

  return {
    stats,
    scoreTrend,
    weeklyActivity,
    weakAreas,
    intervalTrends,
    ...streakInfo,
  };
}

export async function getProgressStats(studentId: string): Promise<ProgressStats> {
  const statsQuery = `
    SELECT
      COUNT(*) as total_sessions,
      COALESCE(SUM(attempted), 0) as total_attempted,
      COALESCE(SUM(correct), 0) as total_correct,
      COALESCE(AVG(score), 0) as avg_score,
      COALESCE(SUM(time_taken), 0) as total_time,
      COALESCE(AVG(time_taken), 0) as avg_time,
      COALESCE(MAX(score), 0) as best_score
    FROM sessions
    WHERE student_id = $1 AND status = 'completed'
  `;

  const [statsResult, recentSessions] = await Promise.all([
    query<{
      total_sessions: string;
      total_attempted: string;
      total_correct: string;
      avg_score: string;
      total_time: string;
      avg_time: string;
      best_score: string;
    }>(statsQuery, [studentId]),
    sessionRepo.getRecentSessions(studentId, 10),
  ]);

  const stats = statsResult.rows[0];
  const totalAttempted = parseInt(stats.total_attempted);
  const totalCorrect = parseInt(stats.total_correct);

  return {
    totalSessions: parseInt(stats.total_sessions),
    totalQuestionsAttempted: totalAttempted,
    totalCorrect: totalCorrect,
    overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
    totalTimeSpent: parseInt(stats.total_time),
    averageScore: parseFloat(stats.avg_score),
    averageTimePerSession: parseFloat(stats.avg_time),
    bestScore: parseFloat(stats.best_score),
    recentSessions,
  };
}

export async function getScoreTrend(studentId: string, days: number): Promise<TrendDataPoint[]> {
  const result = await query<{
    date: Date;
    avg_score: string;
    accuracy: string;
    questions_attempted: string;
  }>(
    `SELECT
       DATE(completed_at) as date,
       AVG(score) as avg_score,
       AVG(CASE WHEN attempted > 0 THEN (correct::float / attempted) * 100 ELSE 0 END) as accuracy,
       SUM(attempted) as questions_attempted
     FROM sessions
     WHERE student_id = $1
       AND status = 'completed'
       AND completed_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(completed_at)
     ORDER BY date`,
    [studentId]
  );

  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    score: parseFloat(row.avg_score),
    accuracy: parseFloat(row.accuracy),
    questionsAttempted: parseInt(row.questions_attempted),
  }));
}

export async function getWeeklyActivity(studentId: string): Promise<WeeklyActivity[]> {
  const result = await query<{
    day: string;
    sessions: string;
    questions: string;
  }>(
    `WITH days AS (
       SELECT generate_series(
         DATE(NOW() - INTERVAL '6 days'),
         DATE(NOW()),
         '1 day'::interval
       )::date as day
     )
     SELECT
       TO_CHAR(d.day, 'Dy') as day,
       COUNT(s.id) as sessions,
       COALESCE(SUM(s.attempted), 0) as questions
     FROM days d
     LEFT JOIN sessions s ON DATE(s.completed_at) = d.day
       AND s.student_id = $1
       AND s.status = 'completed'
     GROUP BY d.day
     ORDER BY d.day`,
    [studentId]
  );

  return result.rows.map((row) => ({
    day: row.day,
    sessions: parseInt(row.sessions),
    questions: parseInt(row.questions),
  }));
}

export async function getWeakAreas(studentId: string): Promise<WeakAreaAnalysis[]> {
  const result = await query<{
    practice_sheet_id: string;
    practice_sheet_name: string;
    sessions_count: string;
    avg_score: string;
    trend: string;
  }>(
    `WITH sheet_stats AS (
       SELECT
         practice_sheet_id,
         practice_sheet_name,
         COUNT(*) as sessions_count,
         AVG(score) as avg_score,
         AVG(score) FILTER (WHERE completed_at >= NOW() - INTERVAL '7 days') as recent_score,
         AVG(score) FILTER (WHERE completed_at < NOW() - INTERVAL '7 days') as older_score
       FROM sessions
       WHERE student_id = $1 AND status = 'completed'
       GROUP BY practice_sheet_id, practice_sheet_name
       HAVING COUNT(*) >= 1
     )
     SELECT
       practice_sheet_id,
       practice_sheet_name,
       sessions_count,
       avg_score,
       CASE
         WHEN recent_score IS NULL OR older_score IS NULL THEN 'stable'
         WHEN recent_score > older_score + 5 THEN 'improving'
         WHEN recent_score < older_score - 5 THEN 'declining'
         ELSE 'stable'
       END as trend
     FROM sheet_stats
     ORDER BY avg_score ASC
     LIMIT 5`,
    [studentId]
  );

  return result.rows.map((row) => ({
    practiceSheetId: row.practice_sheet_id,
    practiceSheetName: row.practice_sheet_name,
    sessionsAttempted: parseInt(row.sessions_count),
    averageScore: parseFloat(row.avg_score),
    trend: row.trend as 'improving' | 'declining' | 'stable',
  }));
}

export async function getIntervalTrends(studentId: string): Promise<IntervalTrendAnalysis[]> {
  const result = await query<{
    interval_number: string;
    avg_questions: string;
    avg_accuracy: string;
    avg_time_per_question: string;
  }>(
    `SELECT
       (interval_data->>'intervalNumber')::int as interval_number,
       AVG((interval_data->>'questionsAttempted')::int) as avg_questions,
       AVG(
         CASE
           WHEN (interval_data->>'questionsAttempted')::int > 0
           THEN ((interval_data->>'correct')::float / (interval_data->>'questionsAttempted')::int) * 100
           ELSE 0
         END
       ) as avg_accuracy,
       AVG((interval_data->>'avgTimePerQuestion')::float) as avg_time_per_question
     FROM sessions, jsonb_array_elements(intervals) as interval_data
     WHERE student_id = $1 AND status = 'completed'
     GROUP BY (interval_data->>'intervalNumber')::int
     ORDER BY interval_number`,
    [studentId]
  );

  return result.rows.map((row) => ({
    intervalNumber: parseInt(row.interval_number),
    averageQuestionsAttempted: parseFloat(row.avg_questions),
    averageAccuracy: parseFloat(row.avg_accuracy),
    averageTimePerQuestion: parseFloat(row.avg_time_per_question),
  }));
}

export async function getStreakInfo(
  studentId: string
): Promise<{ streakDays: number; lastPracticeDate: Date | null }> {
  // Get the most recent practice date
  const lastPracticeResult = await query<{ completed_at: Date }>(
    `SELECT completed_at FROM sessions
     WHERE student_id = $1 AND status = 'completed'
     ORDER BY completed_at DESC
     LIMIT 1`,
    [studentId]
  );

  if (lastPracticeResult.rows.length === 0) {
    return { streakDays: 0, lastPracticeDate: null };
  }

  const lastPracticeDate = lastPracticeResult.rows[0].completed_at;

  // Calculate streak by counting consecutive days with practice
  const streakResult = await query<{ streak: string }>(
    `WITH practice_days AS (
       SELECT DISTINCT DATE(completed_at) as practice_date
       FROM sessions
       WHERE student_id = $1 AND status = 'completed'
     ),
     numbered AS (
       SELECT practice_date,
              practice_date - (ROW_NUMBER() OVER (ORDER BY practice_date))::int as grp
       FROM practice_days
     ),
     streaks AS (
       SELECT MIN(practice_date) as start_date,
              MAX(practice_date) as end_date,
              COUNT(*) as streak_length
       FROM numbered
       GROUP BY grp
     )
     SELECT COALESCE(
       (SELECT streak_length FROM streaks
        WHERE end_date >= DATE(NOW()) - INTERVAL '1 day'
        ORDER BY end_date DESC
        LIMIT 1),
       0
     ) as streak`,
    [studentId]
  );

  return {
    streakDays: parseInt(streakResult.rows[0].streak),
    lastPracticeDate,
  };
}

export async function getSessions(
  studentId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ sessions: SessionSummary[]; total: number }> {
  return sessionRepo.findByStudentId(studentId, limit, offset);
}

export async function getSessionDetail(
  sessionId: string,
  studentId: string
): Promise<SessionDetail | null> {
  return sessionRepo.getSessionDetail(sessionId, studentId);
}

export async function deleteSession(
  sessionId: string,
  studentId: string
): Promise<boolean> {
  return sessionRepo.deleteSession(sessionId, studentId);
}

export async function getActivityByDay(studentId: string, days: number = 84): Promise<ActivityDay[]> {
  const result = await query<{
    date: Date;
    sessions: string;
    questions: string;
  }>(
    `WITH days AS (
       SELECT generate_series(
         DATE(NOW() - INTERVAL '${days - 1} days'),
         DATE(NOW()),
         '1 day'::interval
       )::date as day
     )
     SELECT
       d.day as date,
       COUNT(s.id) as sessions,
       COALESCE(SUM(s.attempted), 0) as questions
     FROM days d
     LEFT JOIN sessions s ON DATE(s.completed_at) = d.day
       AND s.student_id = $1
       AND s.status = 'completed'
     GROUP BY d.day
     ORDER BY d.day`,
    [studentId]
  );

  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    sessions: parseInt(row.sessions),
    questions: parseInt(row.questions),
  }));
}

export async function getWeekComparison(studentId: string): Promise<ComparisonData> {
  const [thisWeekResult, lastWeekResult] = await Promise.all([
    query<{
      sessions: string;
      questions: string;
      correct: string;
      time_spent: string;
      avg_score: string;
    }>(
      `SELECT
         COUNT(*) as sessions,
         COALESCE(SUM(attempted), 0) as questions,
         COALESCE(SUM(correct), 0) as correct,
         COALESCE(SUM(time_taken), 0) as time_spent,
         COALESCE(AVG(score), 0) as avg_score
       FROM sessions
       WHERE student_id = $1
         AND status = 'completed'
         AND completed_at >= DATE(NOW()) - INTERVAL '6 days'`,
      [studentId]
    ),
    query<{
      sessions: string;
      questions: string;
      correct: string;
      time_spent: string;
      avg_score: string;
    }>(
      `SELECT
         COUNT(*) as sessions,
         COALESCE(SUM(attempted), 0) as questions,
         COALESCE(SUM(correct), 0) as correct,
         COALESCE(SUM(time_taken), 0) as time_spent,
         COALESCE(AVG(score), 0) as avg_score
       FROM sessions
       WHERE student_id = $1
         AND status = 'completed'
         AND completed_at >= DATE(NOW()) - INTERVAL '13 days'
         AND completed_at < DATE(NOW()) - INTERVAL '6 days'`,
      [studentId]
    ),
  ]);

  const thisWeek = thisWeekResult.rows[0];
  const lastWeek = lastWeekResult.rows[0];

  const calculateAccuracy = (correct: number, questions: number): number => {
    return questions > 0 ? (correct / questions) * 100 : 0;
  };

  return {
    thisWeek: {
      sessions: parseInt(thisWeek.sessions),
      questions: parseInt(thisWeek.questions),
      correct: parseInt(thisWeek.correct),
      accuracy: calculateAccuracy(parseInt(thisWeek.correct), parseInt(thisWeek.questions)),
      timeSpent: parseInt(thisWeek.time_spent),
      averageScore: parseFloat(thisWeek.avg_score),
    },
    lastWeek: {
      sessions: parseInt(lastWeek.sessions),
      questions: parseInt(lastWeek.questions),
      correct: parseInt(lastWeek.correct),
      accuracy: calculateAccuracy(parseInt(lastWeek.correct), parseInt(lastWeek.questions)),
      timeSpent: parseInt(lastWeek.time_spent),
      averageScore: parseFloat(lastWeek.avg_score),
    },
  };
}

export async function getAttemptedPapers(studentId: string): Promise<AttemptedPaper[]> {
  const result = await query<{
    practice_sheet_id: string;
    practice_sheet_name: string;
    session_count: string;
    last_attempted: Date;
    average_score: string;
  }>(
    `SELECT
       practice_sheet_id,
       practice_sheet_name,
       COUNT(*) as session_count,
       MAX(completed_at) as last_attempted,
       AVG(score) as average_score
     FROM sessions
     WHERE student_id = $1 AND status = 'completed'
     GROUP BY practice_sheet_id, practice_sheet_name
     ORDER BY last_attempted DESC`,
    [studentId]
  );

  return result.rows.map((row) => ({
    practiceSheetId: row.practice_sheet_id,
    practiceSheetName: row.practice_sheet_name,
    sessionCount: parseInt(row.session_count),
    lastAttempted: row.last_attempted.toISOString(),
    averageScore: parseFloat(row.average_score),
  }));
}

export interface ClassComparisonStats {
  classAverageScore: number;
  classAverageTime: number;
  totalStudentsAttempted: number;
  studentRank: number;
  scoreDiff: number; // positive = above average, negative = below
  timeDiff: number; // positive = slower than average, negative = faster
}

export async function getClassComparisonStats(
  sessionId: string,
  studentId: string,
  teacherId: string
): Promise<ClassComparisonStats | null> {
  // First get the session's practice_sheet_id and stats
  const sessionResult = await query<{
    practice_sheet_id: string;
    score: string;
    time_taken: string;
  }>(
    `SELECT practice_sheet_id, score, time_taken
     FROM sessions
     WHERE id = $1 AND student_id = $2 AND status = 'completed'`,
    [sessionId, studentId]
  );

  if (sessionResult.rows.length === 0) {
    return null;
  }

  const session = sessionResult.rows[0];
  const studentScore = parseFloat(session.score);
  const studentTime = parseInt(session.time_taken);

  // Get class statistics for all students under this teacher who attempted the same practice sheet
  const classStatsResult = await query<{
    avg_score: string;
    avg_time: string;
    total_students: string;
  }>(
    `SELECT
       AVG(s.score) as avg_score,
       AVG(s.time_taken) as avg_time,
       COUNT(DISTINCT s.student_id) as total_students
     FROM sessions s
     INNER JOIN students st ON s.student_id = st.id
     WHERE st.teacher_id = $1
       AND s.practice_sheet_id = $2
       AND s.status = 'completed'`,
    [teacherId, session.practice_sheet_id]
  );

  const classStats = classStatsResult.rows[0];
  const classAverageScore = parseFloat(classStats.avg_score) || 0;
  const classAverageTime = parseFloat(classStats.avg_time) || 0;
  const totalStudentsAttempted = parseInt(classStats.total_students) || 0;

  // Get student's rank based on their best score for this practice sheet
  const rankResult = await query<{ rank: string }>(
    `WITH student_best AS (
       SELECT s.student_id, MAX(s.score) as best_score
       FROM sessions s
       INNER JOIN students st ON s.student_id = st.id
       WHERE st.teacher_id = $1
         AND s.practice_sheet_id = $2
         AND s.status = 'completed'
       GROUP BY s.student_id
     ),
     ranked AS (
       SELECT student_id, RANK() OVER (ORDER BY best_score DESC) as rank
       FROM student_best
     )
     SELECT rank FROM ranked WHERE student_id = $3`,
    [teacherId, session.practice_sheet_id, studentId]
  );

  const studentRank = rankResult.rows.length > 0 ? parseInt(rankResult.rows[0].rank) : 0;

  return {
    classAverageScore,
    classAverageTime,
    totalStudentsAttempted,
    studentRank,
    scoreDiff: studentScore - classAverageScore,
    timeDiff: studentTime - classAverageTime,
  };
}

export async function getPaperAnalytics(
  studentId: string,
  practiceSheetId: string,
  dateRange: 'week' | 'month' | 'all' = 'all'
): Promise<PaperAnalytics | null> {
  // Build date filter clause
  let dateFilter = '';
  if (dateRange === 'week') {
    dateFilter = "AND completed_at >= NOW() - INTERVAL '7 days'";
  } else if (dateRange === 'month') {
    dateFilter = "AND completed_at >= NOW() - INTERVAL '30 days'";
  }

  // Get aggregated stats
  const statsResult = await query<{
    practice_sheet_name: string;
    total_sessions: string;
    avg_score: string;
    best_score: string;
    worst_score: string;
    avg_time: string;
    total_attempted: string;
    total_correct: string;
  }>(
    `SELECT
       practice_sheet_name,
       COUNT(*) as total_sessions,
       AVG(score) as avg_score,
       MAX(score) as best_score,
       MIN(score) as worst_score,
       AVG(time_taken) as avg_time,
       SUM(attempted) as total_attempted,
       SUM(correct) as total_correct
     FROM sessions
     WHERE student_id = $1
       AND practice_sheet_id = $2
       AND status = 'completed'
       ${dateFilter}
     GROUP BY practice_sheet_name`,
    [studentId, practiceSheetId]
  );

  if (statsResult.rows.length === 0) {
    return null;
  }

  const stats = statsResult.rows[0];
  const avgScore = parseFloat(stats.avg_score);
  const totalAttempted = parseInt(stats.total_attempted);
  const totalCorrect = parseInt(stats.total_correct);

  // Get session list
  const sessionsResult = await query<{
    id: string;
    completed_at: Date;
    score: string;
    correct: string;
    incorrect: string;
    total_questions: string;
    attempted: string;
    time_taken: string;
  }>(
    `SELECT
       id,
       completed_at,
       score,
       correct,
       incorrect,
       total_questions,
       attempted,
       time_taken
     FROM sessions
     WHERE student_id = $1
       AND practice_sheet_id = $2
       AND status = 'completed'
       ${dateFilter}
     ORDER BY completed_at DESC`,
    [studentId, practiceSheetId]
  );

  const sessions: PaperSessionSummary[] = sessionsResult.rows.map((row) => {
    const sessionScore = parseFloat(row.score);
    let comparedToAverage: 'above' | 'below' | 'equal' = 'equal';
    if (sessionScore > avgScore + 1) {
      comparedToAverage = 'above';
    } else if (sessionScore < avgScore - 1) {
      comparedToAverage = 'below';
    }

    return {
      sessionId: row.id,
      completedAt: row.completed_at.toISOString(),
      score: sessionScore,
      correct: parseInt(row.correct),
      incorrect: parseInt(row.incorrect),
      unanswered: parseInt(row.total_questions) - parseInt(row.attempted),
      totalQuestions: parseInt(row.total_questions),
      timeTaken: parseInt(row.time_taken),
      comparedToAverage,
    };
  });

  // Get score trend for chart
  const trendResult = await query<{
    date: Date;
    score: string;
  }>(
    `SELECT DATE(completed_at) as date, AVG(score) as score
     FROM sessions
     WHERE student_id = $1
       AND practice_sheet_id = $2
       AND status = 'completed'
       ${dateFilter}
     GROUP BY DATE(completed_at)
     ORDER BY date`,
    [studentId, practiceSheetId]
  );

  const scoreTrend = trendResult.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    score: parseFloat(row.score),
  }));

  // Calculate trend (comparing recent vs older scores)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scoreTrend.length >= 2) {
    const midpoint = Math.floor(scoreTrend.length / 2);
    const recentScores = scoreTrend.slice(midpoint);
    const olderScores = scoreTrend.slice(0, midpoint);

    const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length;

    if (recentAvg > olderAvg + 5) {
      trend = 'improving';
    } else if (recentAvg < olderAvg - 5) {
      trend = 'declining';
    }
  }

  return {
    practiceSheetId,
    practiceSheetName: stats.practice_sheet_name,
    totalSessions: parseInt(stats.total_sessions),
    averageScore: avgScore,
    bestScore: parseFloat(stats.best_score),
    worstScore: parseFloat(stats.worst_score),
    averageTimeTaken: parseFloat(stats.avg_time),
    totalQuestionsAttempted: totalAttempted,
    overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
    trend,
    sessions,
    scoreTrend,
  };
}
