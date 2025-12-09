import { v4 as uuidv4 } from 'uuid';
import { Test, Section, TestMode, GenerateTestRequest, Response, TestResult, SectionResult, Question } from '../types';
import * as sessionRepo from '../repositories/session.repository';
import * as practiceSheetRepo from '../repositories/practiceSheet.repository';

// In-memory storage for tests (used as fallback for unauthenticated users)
const testsStore: Map<string, Test> = new Map();
const responsesStore: Map<string, Record<string, Response>> = new Map();
// Map testId to database sessionId for authenticated users
const testToSessionMap: Map<string, string> = new Map();

export interface GenerateTestOptions {
  studentId?: string; // If provided, creates a database session
}

export async function generateTest(request: GenerateTestRequest, options?: GenerateTestOptions): Promise<Test> {
  const testId = uuidv4();

  // Get practice sheet from database
  const dbSheet = await practiceSheetRepo.findById(request.practiceSheetId);
  if (!dbSheet) {
    throw new Error(`Practice sheet not found: ${request.practiceSheetId}`);
  }

  const practiceSheetData = {
    id: dbSheet.id,
    name: dbSheet.name,
    questions: dbSheet.questions,
  };

  const sectionId = uuidv4();

  // Create questions from the practice sheet
  const questions: Question[] = practiceSheetData.questions.map((q, index) => ({
    id: uuidv4(),
    sectionId,
    questionNumber: index + 1,
    expression: q.expression,
    correctAnswer: q.answer,
    isBookmarked: false,
  }));

  // Create a single section with all questions from the practice sheet
  const section: Section = {
    id: sectionId,
    name: practiceSheetData.name,
    type: 'addition_subtraction',
    questions,
    isLocked: false,
    isCompleted: false,
    progress: 0,
    questionCount: questions.length,
  };

  const test: Test = {
    id: testId,
    name: practiceSheetData.name,
    mode: request.mode,
    practiceSheetId: request.practiceSheetId,
    sections: [section],
    totalQuestions: questions.length,
    timeLimit: request.mode === 'test' ? 3600 : null, // 1 hour for test mode
    createdAt: new Date(),
    status: 'not_started',
  };

  // Store the test in memory
  testsStore.set(testId, test);
  responsesStore.set(testId, {});

  // If authenticated, also create a database session
  if (options?.studentId) {
    try {
      const sessionId = await sessionRepo.createSession(
        options.studentId,
        request.practiceSheetId,
        practiceSheetData.name,
        request.mode,
        questions.length
      );
      testToSessionMap.set(testId, sessionId);
    } catch (error) {
      console.error('Failed to create database session:', error);
      // Continue without database persistence
    }
  }

  return test;
}

export function getTest(testId: string): Test | null {
  return testsStore.get(testId) || null;
}

export function saveProgress(
  testId: string,
  responses: Record<string, Response>,
  currentSectionIndex: number,
  currentQuestionIndex: number
): boolean {
  const test = testsStore.get(testId);
  if (!test) return false;

  // Update responses
  responsesStore.set(testId, responses);

  // Update test status
  test.status = 'in_progress';

  // Update section progress
  test.sections.forEach((section, index) => {
    const sectionResponses = section.questions.filter(
      (q) => responses[q.id]?.userAnswer !== null && responses[q.id]?.userAnswer !== undefined
    );
    section.progress = (sectionResponses.length / section.questions.length) * 100;

    // Lock completed sections in test mode
    if (test.mode === 'test' && index < currentSectionIndex) {
      section.isLocked = true;
      section.isCompleted = true;
    }
  });

  testsStore.set(testId, test);
  return true;
}

export interface SubmitTestOptions {
  intervals?: Array<{
    intervalNumber: number;
    startTime: number;
    endTime: number;
    questionsAttempted: number;
    correct: number;
    incorrect: number;
    avgTimePerQuestion: number;
  }>;
}

export async function submitTest(
  testId: string,
  responses: Record<string, Response>,
  timeTaken: number,
  options?: SubmitTestOptions
): Promise<TestResult | null> {
  const test = testsStore.get(testId);
  if (!test) return null;

  // Calculate results
  let totalCorrect = 0;
  let totalAttempted = 0;
  const sectionResults: SectionResult[] = [];

  test.sections.forEach((section) => {
    let sectionCorrect = 0;
    let sectionAttempted = 0;

    section.questions.forEach((question) => {
      const response = responses[question.id];
      if (response?.userAnswer !== null && response?.userAnswer !== undefined) {
        sectionAttempted++;
        totalAttempted++;

        const isCorrect = parseInt(response.userAnswer) === question.correctAnswer;
        if (isCorrect) {
          sectionCorrect++;
          totalCorrect++;
        }
      }
    });

    sectionResults.push({
      sectionId: section.id,
      sectionName: section.name,
      sectionType: section.type,
      total: section.questions.length,
      attempted: sectionAttempted,
      correct: sectionCorrect,
      accuracy: sectionAttempted > 0 ? (sectionCorrect / sectionAttempted) * 100 : 0,
    });

    // Mark section as completed
    section.isCompleted = true;
    section.isLocked = true;
    section.progress = 100;
  });

  // Update test status
  test.status = 'completed';
  testsStore.set(testId, test);

  const result: TestResult = {
    testId,
    totalQuestions: test.totalQuestions,
    attempted: totalAttempted,
    correct: totalCorrect,
    incorrect: totalAttempted - totalCorrect,
    unanswered: test.totalQuestions - totalAttempted,
    score: test.totalQuestions > 0 ? (totalCorrect / test.totalQuestions) * 100 : 0,
    timeTaken,
    sectionResults,
    completedAt: new Date(),
    intervals: options?.intervals,
  };

  // Persist to database if this test has a session
  const sessionId = testToSessionMap.get(testId);
  if (sessionId) {
    try {
      // Collect all questions for database storage
      const allQuestions = test.sections.flatMap((section) =>
        section.questions.map((q) => ({
          id: q.id,
          questionNumber: q.questionNumber,
          expression: q.expression,
          correctAnswer: q.correctAnswer,
        }))
      );

      await sessionRepo.completeSession(sessionId, result, responses, allQuestions);
    } catch (error) {
      console.error('Failed to persist session to database:', error);
      // Continue returning result even if DB persistence fails
    }
  }

  return result;
}

export function getResponses(testId: string): Record<string, Response> | null {
  return responsesStore.get(testId) || null;
}
