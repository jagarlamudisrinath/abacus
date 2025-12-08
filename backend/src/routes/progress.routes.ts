import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';
import * as progressService from '../services/progress.service';

const router = Router();

// All progress routes require authentication
router.use(requireAuth);

/**
 * GET /api/progress/dashboard
 * Get full dashboard data
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const dashboard = await progressService.getDashboardData(studentId);
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/progress/stats
 * Get summary statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const stats = await progressService.getProgressStats(studentId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/progress/sessions
 * Get paginated session history
 */
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await progressService.getSessions(studentId, limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/progress/sessions/:sessionId
 * Get detailed session info
 */
router.get('/sessions/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { sessionId } = req.params;

    const session = await progressService.getSessionDetail(sessionId, studentId);

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session detail:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

/**
 * GET /api/progress/trends
 * Get score trend data
 */
router.get('/trends', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const days = parseInt(req.query.days as string) || 30;

    const scoreTrend = await progressService.getScoreTrend(studentId, days);
    res.json({ scoreTrend });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

/**
 * DELETE /api/progress/sessions/:sessionId
 * Delete a session
 */
router.delete('/sessions/:sessionId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { sessionId } = req.params;

    const deleted = await progressService.deleteSession(sessionId, studentId);

    if (!deleted) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
