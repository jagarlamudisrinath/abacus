import { Router, Response } from 'express';
import { loginOrRegister } from '../services/auth.service';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthenticatedRequest, LoginRequest } from '../types/auth.types';

const router = Router();

/**
 * POST /api/auth/login
 * Login or register with email or student ID
 */
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier, name } = req.body as LoginRequest;

    if (!identifier || identifier.trim() === '') {
      res.status(400).json({ error: 'Email or Student ID is required' });
      return;
    }

    const result = await loginOrRegister({
      identifier: identifier.trim(),
      name: name?.trim(),
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
