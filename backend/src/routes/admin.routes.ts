import { Router, Request, Response } from 'express';
import * as practiceSheetRepo from '../repositories/practiceSheet.repository';
import * as studentRepo from '../repositories/student.repository';
import * as progressService from '../services/progress.service';
import * as authService from '../services/auth.service';
import { requireTeacher } from '../middleware/requireTeacher.middleware';
import { AuthenticatedRequest } from '../types/auth.types';
import { scrapeGoogleForm } from '../utils/googleFormsScraper';

const router = Router();

// Apply requireTeacher middleware to all admin routes
router.use(requireTeacher);

/**
 * Helper to parse bulk import text
 * Supports formats:
 * - Comma separated: "5+3-2,6"
 * - Tab separated: "5+3-2\t6"
 * - Expression only: "5+3-2" (auto-calculates answer)
 */
function parseBulkQuestions(text: string): Array<{ expression: string; answer: number }> {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: Array<{ expression: string; answer: number }> = [];

  for (const line of lines) {
    // Skip comment lines
    if (line.startsWith('#')) continue;

    let expression: string;
    let answer: number;

    // Try comma separation
    if (line.includes(',')) {
      const [expr, ans] = line.split(',').map((s) => s.trim());
      expression = expr;
      answer = parseInt(ans);
    }
    // Try tab separation
    else if (line.includes('\t')) {
      const [expr, ans] = line.split('\t').map((s) => s.trim());
      expression = expr;
      answer = parseInt(ans);
    }
    // Expression only - auto-calculate
    else {
      expression = line;
      try {
        // Only allow simple arithmetic with +/- operators and integers
        if (!/^[\d+\-\s]+$/.test(expression)) {
          throw new Error('Invalid expression');
        }
        answer = eval(expression);
      } catch {
        continue; // Skip invalid expressions
      }
    }

    // Validate
    if (!expression || isNaN(answer)) continue;

    questions.push({ expression, answer });
  }

  return questions;
}

/**
 * Generate a URL-friendly ID from name
 */
function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * GET /api/admin/practice-sheets
 * List practice sheets - teachers only see their own sheets
 */
router.get('/practice-sheets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;

    // Teachers only see their own sheets
    const sheets = await practiceSheetRepo.findByCreator(user.id);
    res.json(sheets);
  } catch (error) {
    console.error('Error fetching practice sheets:', error);
    res.status(500).json({ error: 'Failed to fetch practice sheets' });
  }
});

/**
 * GET /api/admin/practice-sheets/:id
 * Get a single practice sheet with all questions (must be owner)
 */
router.get('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id } = req.params;

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    const sheet = await practiceSheetRepo.findById(id);

    if (!sheet) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    res.json(sheet);
  } catch (error) {
    console.error('Error fetching practice sheet:', error);
    res.status(500).json({ error: 'Failed to fetch practice sheet' });
  }
});

/**
 * GET /api/admin/practice-sheets/:id/export
 * Export practice sheet questions as CSV or TSV (must be owner)
 */
router.get('/practice-sheets/:id/export', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id } = req.params;
    const format = (req.query.format as string) || 'csv';

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    const sheet = await practiceSheetRepo.findById(id);

    if (!sheet) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    // Generate CSV/TSV content
    const delimiter = format === 'tsv' ? '\t' : ',';
    const header = `expression${delimiter}answer`;
    const rows = sheet.questions.map((q) => `${q.expression}${delimiter}${q.answer}`);
    const content = [header, ...rows].join('\n');

    // Set headers for file download
    const filename = `${sheet.id}-questions.${format}`;
    res.setHeader('Content-Type', format === 'tsv' ? 'text/tab-separated-values' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error('Error exporting practice sheet:', error);
    res.status(500).json({ error: 'Failed to export practice sheet' });
  }
});

/**
 * POST /api/admin/practice-sheets
 * Create a new practice sheet
 */
router.post('/practice-sheets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id, name, questions } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Generate ID if not provided
    const sheetId = id || generateId(name);

    // Check if ID already exists
    const exists = await practiceSheetRepo.exists(sheetId);
    if (exists) {
      res.status(409).json({ error: 'A practice sheet with this ID already exists' });
      return;
    }

    // Set created_by to the authenticated user (teacher)
    const sheet = await practiceSheetRepo.create(
      sheetId,
      name,
      questions || [],
      user.id
    );

    res.status(201).json(sheet);
  } catch (error) {
    console.error('Error creating practice sheet:', error);
    res.status(500).json({ error: 'Failed to create practice sheet' });
  }
});

/**
 * PUT /api/admin/practice-sheets/:id
 * Update practice sheet metadata (must be owner)
 */
router.put('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    const updated = await practiceSheetRepo.update(id, name);

    if (!updated) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    res.json({
      id: updated.id,
      name: updated.name,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('Error updating practice sheet:', error);
    res.status(500).json({ error: 'Failed to update practice sheet' });
  }
});

/**
 * DELETE /api/admin/practice-sheets/:id
 * Delete a practice sheet (must be owner)
 */
router.delete('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id } = req.params;

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    const deleted = await practiceSheetRepo.deleteSheet(id);

    if (!deleted) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting practice sheet:', error);
    res.status(500).json({ error: 'Failed to delete practice sheet' });
  }
});

/**
 * POST /api/admin/practice-sheets/:id/questions
 * Add questions to a practice sheet (single or bulk) - must be owner
 */
router.post('/practice-sheets/:id/questions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id } = req.params;
    const { questions, bulkText, replace } = req.body;

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    let questionsToAdd: Array<{ expression: string; answer: number }> = [];

    // Parse bulk text if provided
    if (bulkText) {
      questionsToAdd = parseBulkQuestions(bulkText);
    } else if (questions && Array.isArray(questions)) {
      questionsToAdd = questions;
    }

    if (questionsToAdd.length === 0) {
      res.status(400).json({ error: 'No valid questions provided' });
      return;
    }

    let count: number;
    if (replace) {
      // Replace all questions
      count = await practiceSheetRepo.replaceQuestions(id, questionsToAdd);
    } else {
      // Append questions
      count = await practiceSheetRepo.addQuestions(id, questionsToAdd);
    }

    res.json({ success: true, questionsAdded: count });
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ error: 'Failed to add questions' });
  }
});

/**
 * PUT /api/admin/practice-sheets/:id/questions/:questionNumber
 * Update a single question (must be owner)
 */
router.put('/practice-sheets/:id/questions/:questionNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id, questionNumber } = req.params;
    const { expression, answer } = req.body;

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    if (!expression || answer === undefined) {
      res.status(400).json({ error: 'Expression and answer are required' });
      return;
    }

    const updated = await practiceSheetRepo.updateQuestion(
      id,
      parseInt(questionNumber),
      expression,
      answer
    );

    if (!updated) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

/**
 * DELETE /api/admin/practice-sheets/:id/questions/:questionNumber
 * Delete a single question (must be owner)
 */
router.delete('/practice-sheets/:id/questions/:questionNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { id, questionNumber } = req.params;

    // Verify ownership
    const isOwner = await practiceSheetRepo.belongsTo(id, user.id);
    if (!isOwner) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }

    const deleted = await practiceSheetRepo.deleteQuestion(id, parseInt(questionNumber));

    if (!deleted) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

/**
 * POST /api/admin/practice-sheets/parse-bulk
 * Preview bulk import parsing (dry run)
 */
router.post('/practice-sheets/parse-bulk', async (req: Request, res: Response) => {
  try {
    const { bulkText } = req.body;

    if (!bulkText) {
      res.status(400).json({ error: 'bulkText is required' });
      return;
    }

    const questions = parseBulkQuestions(bulkText);
    res.json({ questions, count: questions.length });
  } catch (error) {
    console.error('Error parsing bulk text:', error);
    res.status(500).json({ error: 'Failed to parse bulk text' });
  }
});

/**
 * POST /api/admin/practice-sheets/scrape-google-form
 * Scrape questions from a Google Form URL
 */
router.post('/practice-sheets/scrape-google-form', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    const questions = await scrapeGoogleForm(url);
    res.json({ questions, count: questions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scrape Google Form';
    console.error('Error scraping Google Form:', error);
    res.status(400).json({ error: message });
  }
});

// =====================================
// Student Management Routes
// =====================================

/**
 * GET /api/admin/students
 * List students - all students for superuser, teacher's students otherwise
 */
router.get('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;

    // Superuser gets all students globally
    if (user.role === 'superuser') {
      const students = await studentRepo.findAllStudentsGlobal();
      res.json(students);
      return;
    }

    // Teacher gets their own students
    const students = await studentRepo.findStudentsByTeacherId(user.id);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * POST /api/admin/students
 * Create a new student under this teacher
 * Body: { firstName, lastName, grade?, email? }
 * Student ID is auto-generated (S001, S002, etc.)
 */
router.post('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacherId = req.student!.id;
    const { firstName, lastName, grade, email } = req.body;

    if (!firstName || firstName.trim() === '') {
      res.status(400).json({ error: 'First name is required' });
      return;
    }

    if (!lastName || lastName.trim() === '') {
      res.status(400).json({ error: 'Last name is required' });
      return;
    }

    const student = await studentRepo.createStudentForTeacher(
      firstName.trim(),
      lastName.trim(),
      teacherId,
      grade?.trim(),
      email?.trim()
    );

    res.status(201).json(student);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create student';
    console.error('Error creating student:', error);
    res.status(400).json({ error: message });
  }
});

/**
 * PUT /api/admin/students/:id
 * Update a student's details
 * Body: { firstName?, lastName?, grade?, email? }
 */
router.put('/students/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, grade, email } = req.body;

    // At least one field must be provided
    if (!firstName && !lastName && grade === undefined && email === undefined) {
      res.status(400).json({ error: 'At least one field (firstName, lastName, grade, or email) is required' });
      return;
    }

    const updates: { firstName?: string; lastName?: string; grade?: string; email?: string } = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (grade !== undefined) updates.grade = grade.trim();
    if (email !== undefined) updates.email = email.trim();

    const student = await studentRepo.updateStudent(id, updates);

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

/**
 * DELETE /api/admin/students/:id
 * Delete a student
 */
router.delete('/students/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await studentRepo.deleteStudent(id);

    if (!deleted) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

/**
 * POST /api/admin/students/:id/set-password
 * Set or update a student's password (teacher action)
 * Body: { password }
 */
router.post('/students/:id/set-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password, forcePasswordChange = true } = req.body;
    const teacher = req.student!;

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    // Verify student exists and belongs to teacher (or teacher is superuser)
    const student = await studentRepo.findById(id);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Only allow setting password for actual students (not teachers/superusers)
    if (student.role !== 'student') {
      res.status(400).json({ error: 'Can only set password for students' });
      return;
    }

    // Teachers can only set password for their own students
    if (teacher.role !== 'superuser' && student.teacherId !== teacher.id) {
      res.status(403).json({ error: 'Access denied: Student does not belong to this teacher' });
      return;
    }

    await authService.setStudentPassword(id, password, forcePasswordChange);

    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set password';
    console.error('Error setting student password:', error);
    res.status(400).json({ error: message });
  }
});

// =====================================
// Student Progress/Activity Routes
// =====================================

/**
 * Helper to verify student belongs to teacher (or user is superuser)
 */
async function verifyStudentAccess(
  studentId: string,
  teacherId: string,
  isSuperuser: boolean
): Promise<{ valid: boolean; error?: string }> {
  const student = await studentRepo.findById(studentId);
  if (!student) {
    return { valid: false, error: 'Student not found' };
  }
  // Superuser can access any student
  if (isSuperuser) {
    return { valid: true };
  }
  // Teachers can only access their own students
  if (student.teacherId !== teacherId) {
    return { valid: false, error: 'Access denied: Student does not belong to this teacher' };
  }
  return { valid: true };
}

/**
 * GET /api/admin/students/:studentId/dashboard
 * Get student's full dashboard data
 */
router.get('/students/:studentId/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { studentId } = req.params;

    const verification = await verifyStudentAccess(studentId, user.id, user.role === 'superuser');
    if (!verification.valid) {
      res.status(verification.error === 'Student not found' ? 404 : 403).json({ error: verification.error });
      return;
    }

    const dashboard = await progressService.getDashboardData(studentId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch student dashboard' });
  }
});

/**
 * GET /api/admin/students/:studentId/sessions
 * Get student's session history (paginated)
 */
router.get('/students/:studentId/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const verification = await verifyStudentAccess(studentId, user.id, user.role === 'superuser');
    if (!verification.valid) {
      res.status(verification.error === 'Student not found' ? 404 : 403).json({ error: verification.error });
      return;
    }

    const result = await progressService.getSessions(studentId, limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    res.status(500).json({ error: 'Failed to fetch student sessions' });
  }
});

/**
 * GET /api/admin/students/:studentId/sessions/:sessionId
 * Get detailed session info
 */
router.get('/students/:studentId/sessions/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { studentId, sessionId } = req.params;

    const verification = await verifyStudentAccess(studentId, user.id, user.role === 'superuser');
    if (!verification.valid) {
      res.status(verification.error === 'Student not found' ? 404 : 403).json({ error: verification.error });
      return;
    }

    const session = await progressService.getSessionDetail(sessionId, studentId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching student session detail:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

/**
 * GET /api/admin/students/:studentId/sessions/:sessionId/class-comparison
 * Get class comparison stats for a specific session (teacher insights)
 */
router.get('/students/:studentId/sessions/:sessionId/class-comparison', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.student!;
    const { studentId, sessionId } = req.params;

    const verification = await verifyStudentAccess(studentId, user.id, user.role === 'superuser');
    if (!verification.valid) {
      res.status(verification.error === 'Student not found' ? 404 : 403).json({ error: verification.error });
      return;
    }

    // Use the teacher's ID for class comparison (or user's ID for superuser)
    const teacherId = user.role === 'superuser' ? user.id : user.id;

    const classStats = await progressService.getClassComparisonStats(sessionId, studentId, teacherId);

    if (!classStats) {
      res.status(404).json({ error: 'Session not found or no comparison data available' });
      return;
    }

    res.json(classStats);
  } catch (error) {
    console.error('Error fetching class comparison stats:', error);
    res.status(500).json({ error: 'Failed to fetch class comparison stats' });
  }
});

export default router;
