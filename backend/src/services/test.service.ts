import { v4 as uuidv4 } from 'uuid';
import { Test, Section, TestMode, GenerateTestRequest, Response, TestResult, SectionResult, Question } from '../types';
import { getPracticeSheetById } from '../data/practiceSheets';

// In-memory storage for tests (in production, use a database)
const testsStore: Map<string, Test> = new Map();
const responsesStore: Map<string, Record<string, Response>> = new Map();

export function generateTest(request: GenerateTestRequest): Test {
  const testId = uuidv4();

  // Get the practice sheet by ID
  const practiceSheet = getPracticeSheetById(request.practiceSheetId);
  if (!practiceSheet) {
    throw new Error(`Practice sheet not found: ${request.practiceSheetId}`);
  }

  const sectionId = uuidv4();

  // Create questions from the practice sheet
  const questions: Question[] = practiceSheet.questions.map((q, index) => ({
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
    name: practiceSheet.name,
    type: 'addition_subtraction',
    questions,
    isLocked: false,
    isCompleted: false,
    progress: 0,
    questionCount: questions.length,
  };

  const test: Test = {
    id: testId,
    name: practiceSheet.name,
    mode: request.mode,
    practiceSheetId: request.practiceSheetId,
    sections: [section],
    totalQuestions: questions.length,
    timeLimit: request.mode === 'test' ? 3600 : null, // 1 hour for test mode
    createdAt: new Date(),
    status: 'not_started',
  };

  // Store the test
  testsStore.set(testId, test);
  responsesStore.set(testId, {});

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

export function submitTest(
  testId: string,
  responses: Record<string, Response>,
  timeTaken: number
): TestResult | null {
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
  };

  return result;
}

export function getResponses(testId: string): Record<string, Response> | null {
  return responsesStore.get(testId) || null;
}
