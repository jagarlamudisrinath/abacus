import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { login, loginOrRegister, loginTeacher } from '../services/auth.service';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthenticatedRequest, LoginRequest, TeacherLoginRequest } from '../types/auth.types';
import * as studentRepo from '../repositories/student.repository';

const router = Router();

/**
 * POST /api/auth/login
 * Unified login for all users (students, teachers, superusers)
 * Accepts { identifier, password } where identifier can be email or student ID
 */
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || identifier.trim() === '') {
      res.status(400).json({ error: 'Email or Student ID is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const result = await login(identifier.trim(), password);

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/teacher/login
 * Login as a teacher with email and password
 */
router.post('/teacher/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body as TeacherLoginRequest;

    if (!email || email.trim() === '') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const result = await loginTeacher({
      email: email.trim(),
      password,
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(400).json({ error: message });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ student: req.student });
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, just returns success)
 */
router.post('/logout', (req, res: Response) => {
  // JWT tokens are stateless, so logout is handled client-side
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 * Used when mustChangePassword is true after admin password reset
 */
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    const student = req.student;

    if (!student) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Hash and set new password, clear mustChangePassword flag
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const success = await studentRepo.setPasswordHash(student.id, passwordHash, false);

    if (!success) {
      res.status(500).json({ error: 'Failed to change password' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    const message = error instanceof Error ? error.message : 'Failed to change password';
    res.status(500).json({ error: message });
  }
});

export default router;
