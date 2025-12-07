import { query, withTransaction } from '../db';
import { SessionSummary, SessionDetail } from '../types/progress.types';
import { TestResult, SectionResult, Response as QuestionResponse } from '../types';

interface SessionRow {
  id: string;
  student_id: string;
  practice_sheet_id: string;
  practice_sheet_name: string;
  mode: 'practice' | 'test';
  status: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  time_taken: number;
  started_at: Date;
  completed_at: Date | null;
  section_results: any[];
  intervals: any[];
}

interface SessionResponseRow {
  id: string;
  session_id: string;
  question_number: number;
  expression: string;
  correct_answer: number;
  user_answer: string | null;
  is_correct: boolean | null;
  answered_at: Date | null;
  time_spent: number | null;
}

function mapRowToSummary(row: SessionRow): SessionSummary {
  return {
    id: row.id,
    practiceSheetId: row.practice_sheet_id,
    practiceSheetName: row.practice_sheet_name,
    mode: row.mode,
    score: parseFloat(String(row.score)),
    correct: row.correct,
    incorrect: row.incorrect,
    total: row.total_questions,
    attempted: row.attempted,
    timeTaken: row.time_taken,
    completedAt: row.completed_at || row.started_at,
  };
}

export async function createSession(
  studentId: string,
  practiceSheetId: string,
  practiceSheetName: string,
  mode: 'practice' | 'test',
  totalQuestions: number
): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO sessions (student_id, practice_sheet_id, practice_sheet_name, mode, total_questions, status)
     VALUES ($1, $2, $3, $4, $5, 'in_progress')
     RETURNING id`,
    [studentId, practiceSheetId, practiceSheetName, mode, totalQuestions]
  );
  return result.rows[0].id;
}

export async function completeSession(
  sessionId: string,
  result: TestResult,
  responses: Record<string, QuestionResponse>,
  questions: Array<{ id: string; questionNumber: number; expression: string; correctAnswer: number }>
): Promise<void> {
  await withTransaction(async (client) => {
    // Update session with results
    await client.query(
      `UPDATE sessions SET
         status = 'completed',
         attempted = $2,
         correct = $3,
         incorrect = $4,
         unanswered = $5,
         score = $6,
         time_taken = $7,
         completed_at = NOW(),
         section_results = $8,
         intervals = $9
       WHERE id = $1`,
      [
        sessionId,
        result.attempted,
        result.correct,
        result.incorrect,
        result.unanswered,
        result.score,
        result.timeTaken,
        JSON.stringify(result.sectionResults || []),
        JSON.stringify(result.intervals || []),
      ]
    );

    // Insert all responses
    for (const q of questions) {
      const response = responses[q.id];
      await client.query(
        `INSERT INTO session_responses
           (session_id, question_number, expression, correct_answer, user_answer, is_correct, answered_at, time_spent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (session_id, question_number)
         DO UPDATE SET user_answer = $5, is_correct = $6, answered_at = $7, time_spent = $8`,
        [
          sessionId,
          q.questionNumber,
          q.expression,
          q.correctAnswer,
          response?.userAnswer || null,
          response?.isCorrect ?? null,
          response?.answeredAt || null,
          response?.timeSpent ?? null,
        ]
      );
    }
  });
}

export async function findByStudentId(
  studentId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ sessions: SessionSummary[]; total: number }> {
  const [sessionsResult, countResult] = await Promise.all([
    query<SessionRow>(
      `SELECT * FROM sessions
       WHERE student_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM sessions
       WHERE student_id = $1 AND status = 'completed'`,
      [studentId]
    ),
  ]);

  return {
    sessions: sessionsResult.rows.map(mapRowToSummary),
    total: parseInt(countResult.rows[0].count),
  };
}

export async function findById(sessionId: string): Promise<SessionRow | null> {
  const result = await query<SessionRow>(
    'SELECT * FROM sessions WHERE id = $1',
    [sessionId]
  );
  return result.rows[0] || null;
}

export async function getSessionDetail(sessionId: string, studentId: string): Promise<SessionDetail | null> {
  const [sessionResult, responsesResult] = await Promise.all([
    query<SessionRow>(
      'SELECT * FROM sessions WHERE id = $1 AND student_id = $2',
      [sessionId, studentId]
    ),
    query<SessionResponseRow>(
      'SELECT * FROM session_responses WHERE session_id = $1 ORDER BY question_number',
      [sessionId]
    ),
  ]);

  const session = sessionResult.rows[0];
  if (!session) return null;

  return {
    id: session.id,
    practiceSheetId: session.practice_sheet_id,
    practiceSheetName: session.practice_sheet_name,
    mode: session.mode,
    score: parseFloat(String(session.score)),
    correct: session.correct,
    incorrect: session.incorrect,
    total: session.total_questions,
    attempted: session.attempted,
    timeTaken: session.time_taken,
    completedAt: session.completed_at || session.started_at,
    sectionResults: session.section_results || [],
    intervals: session.intervals || [],
    responses: responsesResult.rows.map((r) => ({
      questionNumber: r.question_number,
      expression: r.expression,
      correctAnswer: r.correct_answer,
      userAnswer: r.user_answer,
      isCorrect: r.is_correct,
      timeSpent: r.time_spent,
    })),
  };
}

export async function getRecentSessions(studentId: string, limit: number = 10): Promise<SessionSummary[]> {
  const result = await query<SessionRow>(
    `SELECT * FROM sessions
     WHERE student_id = $1 AND status = 'completed'
     ORDER BY completed_at DESC
     LIMIT $2`,
    [studentId, limit]
  );
  return result.rows.map(mapRowToSummary);
}
