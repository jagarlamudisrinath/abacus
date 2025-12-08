import { query, withTransaction } from '../db';

export interface PracticeSheetRow {
  id: string;
  name: string;
  form_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PracticeSheetQuestionRow {
  id: string;
  practice_sheet_id: string;
  question_number: number;
  expression: string;
  answer: number;
}

export interface PracticeSheetSummary {
  id: string;
  name: string;
  formUrl: string | null;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSheetDetail {
  id: string;
  name: string;
  formUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  questions: Array<{
    questionNumber: number;
    expression: string;
    answer: number;
  }>;
}

export interface Question {
  expression: string;
  answer: number;
}

/**
 * Get all practice sheets with question counts
 */
export async function findAll(): Promise<PracticeSheetSummary[]> {
  const result = await query<PracticeSheetRow & { question_count: string }>(
    `SELECT ps.*, COUNT(psq.id) as question_count
     FROM practice_sheets ps
     LEFT JOIN practice_sheet_questions psq ON ps.id = psq.practice_sheet_id
     GROUP BY ps.id
     ORDER BY ps.name`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    formUrl: row.form_url,
    questionCount: parseInt(row.question_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get a single practice sheet with all its questions
 */
export async function findById(id: string): Promise<PracticeSheetDetail | null> {
  const [sheetResult, questionsResult] = await Promise.all([
    query<PracticeSheetRow>(
      'SELECT * FROM practice_sheets WHERE id = $1',
      [id]
    ),
    query<PracticeSheetQuestionRow>(
      'SELECT * FROM practice_sheet_questions WHERE practice_sheet_id = $1 ORDER BY question_number',
      [id]
    ),
  ]);

  const sheet = sheetResult.rows[0];
  if (!sheet) return null;

  return {
    id: sheet.id,
    name: sheet.name,
    formUrl: sheet.form_url,
    createdAt: sheet.created_at,
    updatedAt: sheet.updated_at,
    questions: questionsResult.rows.map((q) => ({
      questionNumber: q.question_number,
      expression: q.expression,
      answer: q.answer,
    })),
  };
}

/**
 * Create a new practice sheet
 */
export async function create(
  id: string,
  name: string,
  formUrl: string | null,
  questions: Question[]
): Promise<PracticeSheetDetail> {
  return await withTransaction(async (client) => {
    // Insert practice sheet
    await client.query(
      `INSERT INTO practice_sheets (id, name, form_url)
       VALUES ($1, $2, $3)`,
      [id, name, formUrl]
    );

    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await client.query(
        `INSERT INTO practice_sheet_questions (practice_sheet_id, question_number, expression, answer)
         VALUES ($1, $2, $3, $4)`,
        [id, i + 1, q.expression, q.answer]
      );
    }

    // Return the created sheet
    const result = await client.query<PracticeSheetRow>(
      'SELECT * FROM practice_sheets WHERE id = $1',
      [id]
    );
    const sheet = result.rows[0];

    return {
      id: sheet.id,
      name: sheet.name,
      formUrl: sheet.form_url,
      createdAt: sheet.created_at,
      updatedAt: sheet.updated_at,
      questions: questions.map((q, i) => ({
        questionNumber: i + 1,
        expression: q.expression,
        answer: q.answer,
      })),
    };
  });
}

/**
 * Update practice sheet metadata (name, formUrl)
 */
export async function update(
  id: string,
  name: string,
  formUrl: string | null
): Promise<PracticeSheetRow | null> {
  const result = await query<PracticeSheetRow>(
    `UPDATE practice_sheets
     SET name = $2, form_url = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, formUrl]
  );
  return result.rows[0] || null;
}

/**
 * Delete a practice sheet (cascades to questions)
 */
export async function deleteSheet(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM practice_sheets WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Add questions to a practice sheet (appends to existing)
 */
export async function addQuestions(
  practiceSheetId: string,
  questions: Question[]
): Promise<number> {
  // Get the current max question number
  const maxResult = await query<{ max: number | null }>(
    'SELECT MAX(question_number) as max FROM practice_sheet_questions WHERE practice_sheet_id = $1',
    [practiceSheetId]
  );
  const startNumber = (maxResult.rows[0].max || 0) + 1;

  await withTransaction(async (client) => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await client.query(
        `INSERT INTO practice_sheet_questions (practice_sheet_id, question_number, expression, answer)
         VALUES ($1, $2, $3, $4)`,
        [practiceSheetId, startNumber + i, q.expression, q.answer]
      );
    }

    // Update the practice sheet's updated_at
    await client.query(
      'UPDATE practice_sheets SET updated_at = NOW() WHERE id = $1',
      [practiceSheetId]
    );
  });

  return questions.length;
}

/**
 * Replace all questions for a practice sheet
 */
export async function replaceQuestions(
  practiceSheetId: string,
  questions: Question[]
): Promise<number> {
  await withTransaction(async (client) => {
    // Delete existing questions
    await client.query(
      'DELETE FROM practice_sheet_questions WHERE practice_sheet_id = $1',
      [practiceSheetId]
    );

    // Insert new questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await client.query(
        `INSERT INTO practice_sheet_questions (practice_sheet_id, question_number, expression, answer)
         VALUES ($1, $2, $3, $4)`,
        [practiceSheetId, i + 1, q.expression, q.answer]
      );
    }

    // Update the practice sheet's updated_at
    await client.query(
      'UPDATE practice_sheets SET updated_at = NOW() WHERE id = $1',
      [practiceSheetId]
    );
  });

  return questions.length;
}

/**
 * Update a single question
 */
export async function updateQuestion(
  practiceSheetId: string,
  questionNumber: number,
  expression: string,
  answer: number
): Promise<boolean> {
  const result = await query(
    `UPDATE practice_sheet_questions
     SET expression = $3, answer = $4
     WHERE practice_sheet_id = $1 AND question_number = $2`,
    [practiceSheetId, questionNumber, expression, answer]
  );

  if ((result.rowCount ?? 0) > 0) {
    await query(
      'UPDATE practice_sheets SET updated_at = NOW() WHERE id = $1',
      [practiceSheetId]
    );
    return true;
  }
  return false;
}

/**
 * Delete a single question and renumber the rest
 */
export async function deleteQuestion(
  practiceSheetId: string,
  questionNumber: number
): Promise<boolean> {
  return await withTransaction(async (client) => {
    // Delete the question
    const deleteResult = await client.query(
      'DELETE FROM practice_sheet_questions WHERE practice_sheet_id = $1 AND question_number = $2',
      [practiceSheetId, questionNumber]
    );

    if ((deleteResult.rowCount ?? 0) === 0) {
      return false;
    }

    // Renumber subsequent questions
    await client.query(
      `UPDATE practice_sheet_questions
       SET question_number = question_number - 1
       WHERE practice_sheet_id = $1 AND question_number > $2`,
      [practiceSheetId, questionNumber]
    );

    // Update the practice sheet's updated_at
    await client.query(
      'UPDATE practice_sheets SET updated_at = NOW() WHERE id = $1',
      [practiceSheetId]
    );

    return true;
  });
}

/**
 * Check if a practice sheet ID already exists
 */
export async function exists(id: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM practice_sheets WHERE id = $1) as exists',
    [id]
  );
  return result.rows[0].exists;
}
