import { Router, Request, Response } from 'express';
import { generateTest, getTest, saveProgress, submitTest, getResponses } from '../services/test.service';
import { GenerateTestRequest, SaveProgressRequest, SubmitTestRequest } from '../types';
import { getAllPracticeSheets } from '../data/practiceSheets';
import { optionalAuth } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types/auth.types';

const router = Router();

// Get available practice sheets
router.get('/practice-sheets', (req: Request, res: Response) => {
  try {
    const sheets = getAllPracticeSheets();
    res.json({ sheets });
  } catch (error) {
    console.error('Error getting practice sheets:', error);
    res.status(500).json({ error: 'Failed to get practice sheets' });
  }
});

// Generate a new test (with optional auth to enable persistence)
router.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mode, practiceSheetId, candidateName } = req.body as GenerateTestRequest;

    if (!mode || !practiceSheetId || !candidateName) {
      res.status(400).json({ error: 'Missing required fields: mode, practiceSheetId, candidateName' });
      return;
    }

    const test = await generateTest(
      { mode, practiceSheetId, candidateName },
      { studentId: req.student?.id }
    );

    res.json({ test });
  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({ error: 'Failed to generate test' });
  }
});

// Get test by ID
router.get('/:testId', (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const test = getTest(testId);

    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    const responses = getResponses(testId);
    res.json({ test, responses });
  } catch (error) {
    console.error('Error getting test:', error);
    res.status(500).json({ error: 'Failed to get test' });
  }
});

// Save test progress
router.post('/:testId/save', (req: Request<{ testId: string }, {}, SaveProgressRequest>, res: Response) => {
  try {
    const { testId } = req.params;
    const { responses, currentSectionIndex, currentQuestionIndex } = req.body;

    const success = saveProgress(testId, responses, currentSectionIndex, currentQuestionIndex);

    if (!success) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    res.json({ success: true, savedAt: new Date() });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Submit completed test
router.post('/:testId/submit', async (req: Request<{ testId: string }, {}, SubmitTestRequest>, res: Response) => {
  try {
    const { testId } = req.params;
    const { responses, timeTaken, intervals } = req.body;

    const result = await submitTest(testId, responses, timeTaken, { intervals });

    if (!result) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    res.json({ result });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

export default router;
