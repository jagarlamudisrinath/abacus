import { Router, Response } from 'express';
import { loginOrRegister, registerTeacher, loginTeacher } from '../services/auth.service';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthenticatedRequest, LoginRequest, TeacherRegisterRequest, TeacherLoginRequest } from '../types/auth.types';

const router = Router();

/**
 * POST /api/auth/login
 * Login with email or student ID (for students)
 * Note: Student self-signup is disabled - students can only be created by teachers or admins
 */
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier } = req.body as LoginRequest;

    if (!identifier || identifier.trim() === '') {
      res.status(400).json({ error: 'Email or Student ID is required' });
      return;
    }

    const result = await loginOrRegister({
      identifier: identifier.trim(),
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/teacher/register
 * Register a new teacher with email and password
 */
router.post('/teacher/register', async (req, res: Response) => {
  try {
    const { email, password, name } = req.body as TeacherRegisterRequest;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await registerTeacher({
      email: email.trim(),
      password,
      name: name.trim(),
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
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

export default router;
