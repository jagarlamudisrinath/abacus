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
