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

/**
 * GET /api/progress/activity
 * Get daily activity for heatmap (last 84 days by default)
 */
router.get('/activity', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const days = parseInt(req.query.days as string) || 84;

    const activity = await progressService.getActivityByDay(studentId, days);
    res.json({ activity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

/**
 * GET /api/progress/comparison
 * Get this week vs last week comparison
 */
router.get('/comparison', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const comparison = await progressService.getWeekComparison(studentId);
    res.json(comparison);
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

/**
 * GET /api/progress/attempted-papers
 * Get list of practice papers the student has attempted
 */
router.get('/attempted-papers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const papers = await progressService.getAttemptedPapers(studentId);
    res.json(papers);
  } catch (error) {
    console.error('Error fetching attempted papers:', error);
    res.status(500).json({ error: 'Failed to fetch attempted papers' });
  }
});

/**
 * GET /api/progress/paper-analytics/:practiceSheetId
 * Get detailed analytics for a specific practice paper
 * Query params: range (week | month | all)
 */
router.get('/paper-analytics/:practiceSheetId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.student!.id;
    const { practiceSheetId } = req.params;
    const range = (req.query.range as 'week' | 'month' | 'all') || 'all';

    const analytics = await progressService.getPaperAnalytics(studentId, practiceSheetId, range);

    if (!analytics) {
      res.status(404).json({ error: 'No sessions found for this practice paper' });
      return;
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching paper analytics:', error);
    res.status(500).json({ error: 'Failed to fetch paper analytics' });
  }
});

export default router;
