import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { requireSuperuser } from '../middleware/requireSuperuser.middleware';
import { AuthenticatedRequest } from '../types/auth.types';
import * as studentRepo from '../repositories/student.repository';
import * as practiceSheetRepo from '../repositories/practiceSheet.repository';

const router = Router();

// All routes require superuser authentication
router.use(requireSuperuser);

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

// POST /api/superuser/teachers - Create a new teacher
router.post('/teachers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, name, password, forcePasswordChange = true } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const existing = await studentRepo.findByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password and create teacher with mustChangePassword based on forcePasswordChange
    const passwordHash = await bcrypt.hash(password, 10);
    const teacher = await studentRepo.createTeacher(email.trim(), name.trim(), passwordHash, forcePasswordChange);

    res.status(201).json({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      createdAt: teacher.createdAt,
      lastLoginAt: teacher.lastLoginAt,
      studentCount: 0,
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// GET /api/superuser/teachers - List all teachers
router.get('/teachers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teachers = await studentRepo.findAllTeachers();
    res.json(teachers.map(t => ({
      id: t.id,
      email: t.email,
      name: t.name,
      createdAt: t.createdAt,
      lastLoginAt: t.lastLoginAt,
      studentCount: t.studentCount,
    })));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// GET /api/superuser/teachers/:id - Get teacher details
router.get('/teachers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacher = await studentRepo.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    // Get teacher's students
    const students = await studentRepo.findStudentsByTeacherId(teacher.id);

    res.json({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      createdAt: teacher.createdAt,
      lastLoginAt: teacher.lastLoginAt,
      students: students.map(s => ({
        id: s.id,
        studentId: s.studentId,
        name: s.name,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: s.grade,
        email: s.email,
        lastLoginAt: s.lastLoginAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ error: 'Failed to fetch teacher details' });
  }
});

// PUT /api/superuser/teachers/:id - Update teacher
router.put('/teachers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    const updated = await studentRepo.updateTeacherInfo(req.params.id, { name, email });
    if (!updated) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      createdAt: updated.createdAt,
      lastLoginAt: updated.lastLoginAt,
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// DELETE /api/superuser/teachers/:id - Delete teacher
router.delete('/teachers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await studentRepo.deleteTeacher(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// GET /api/superuser/teachers/:id/students - Get teacher's students
router.get('/teachers/:id/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacher = await studentRepo.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    const students = await studentRepo.findStudentsByTeacherId(req.params.id);
    res.json(students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      name: s.name,
      firstName: s.firstName,
      lastName: s.lastName,
      grade: s.grade,
      email: s.email,
      lastLoginAt: s.lastLoginAt,
    })));
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/superuser/students - List ALL students
router.get('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const students = await studentRepo.findAllStudentsGlobal();
    res.json(students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      name: s.name,
      firstName: s.firstName,
      lastName: s.lastName,
      grade: s.grade,
      email: s.email,
      teacherId: s.teacherId,
      teacherName: s.teacherName,
      lastLoginAt: s.lastLoginAt,
      createdAt: s.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// PUT /api/superuser/students/:id/reassign - Reassign student to different teacher
router.put('/students/:id/reassign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teacherId } = req.body;

    // Verify teacherId is valid if provided
    if (teacherId) {
      const teacher = await studentRepo.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        res.status(400).json({ error: 'Invalid teacher ID' });
        return;
      }
    }

    const updated = await studentRepo.reassignStudent(req.params.id, teacherId || null);
    if (!updated) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({
      id: updated.id,
      studentId: updated.studentId,
      name: updated.name,
      teacherId: updated.teacherId,
    });
  } catch (error) {
    console.error('Error reassigning student:', error);
    res.status(500).json({ error: 'Failed to reassign student' });
  }
});

// POST /api/superuser/teachers/:id/set-password - Set/reset teacher password
router.post('/teachers/:id/set-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password, forcePasswordChange = true } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Verify the teacher exists
    const teacher = await studentRepo.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    // Hash and set password with mustChangePassword based on forcePasswordChange
    const passwordHash = await bcrypt.hash(password, 10);
    const success = await studentRepo.setPasswordHash(req.params.id, passwordHash, forcePasswordChange);

    if (!success) {
      res.status(500).json({ error: 'Failed to set password' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error setting teacher password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// POST /api/superuser/students/:id/set-password - Set/reset student password
router.post('/students/:id/set-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password, forcePasswordChange = true } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Verify the student exists
    const student = await studentRepo.findById(req.params.id);
    if (!student || student.role !== 'student') {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Hash and set password with mustChangePassword based on forcePasswordChange
    const passwordHash = await bcrypt.hash(password, 10);
    const success = await studentRepo.setPasswordHash(req.params.id, passwordHash, forcePasswordChange);

    if (!success) {
      res.status(500).json({ error: 'Failed to set password' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error setting student password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// ==================== PRACTICE SHEETS ====================

// POST /api/superuser/practice-sheets - Create a new practice sheet
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

    // Set created_by to the superuser
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

// GET /api/superuser/practice-sheets - List ALL practice sheets with creator info
router.get('/practice-sheets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sheets = await practiceSheetRepo.findAllWithCreator();
    res.json(sheets);
  } catch (error) {
    console.error('Error fetching practice sheets:', error);
    res.status(500).json({ error: 'Failed to fetch practice sheets' });
  }
});

// GET /api/superuser/practice-sheets/:id - Get practice sheet details with questions
router.get('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sheet = await practiceSheetRepo.findById(req.params.id);
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

// PUT /api/superuser/practice-sheets/:id - Update practice sheet name
router.put('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const updated = await practiceSheetRepo.update(req.params.id, name.trim());
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

// DELETE /api/superuser/practice-sheets/:id - Delete practice sheet
router.delete('/practice-sheets/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await practiceSheetRepo.deleteSheet(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Practice sheet not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting practice sheet:', error);
    res.status(500).json({ error: 'Failed to delete practice sheet' });
  }
});

// POST /api/superuser/practice-sheets/:id/questions - Add questions (single or bulk)
router.post('/practice-sheets/:id/questions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questions, bulkText, replace } = req.body;

    // Verify sheet exists
    const exists = await practiceSheetRepo.exists(id);
    if (!exists) {
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

// PUT /api/superuser/practice-sheets/:id/questions/:questionNumber - Update a question
router.put('/practice-sheets/:id/questions/:questionNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expression, answer } = req.body;
    const questionNumber = parseInt(req.params.questionNumber);

    if (!expression || answer === undefined) {
      res.status(400).json({ error: 'Expression and answer are required' });
      return;
    }

    const success = await practiceSheetRepo.updateQuestion(
      req.params.id,
      questionNumber,
      expression,
      answer
    );

    if (!success) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/superuser/practice-sheets/:id/questions/:questionNumber - Delete a question
router.delete('/practice-sheets/:id/questions/:questionNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questionNumber = parseInt(req.params.questionNumber);

    const success = await practiceSheetRepo.deleteQuestion(req.params.id, questionNumber);
    if (!success) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
