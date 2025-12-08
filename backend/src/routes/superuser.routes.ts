import { Router, Response } from 'express';
import { requireSuperuser } from '../middleware/requireSuperuser.middleware';
import { AuthenticatedRequest } from '../types/auth.types';
import * as studentRepo from '../repositories/student.repository';

const router = Router();

// All routes require superuser authentication
router.use(requireSuperuser);

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

export default router;
