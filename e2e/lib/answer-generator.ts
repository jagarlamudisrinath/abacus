import { evaluateExpression, generateWrongAnswer } from './expression-parser';
import { Question, QuestionResponse } from './api-client';

export interface GeneratedResponse extends QuestionResponse {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  startedAt: Date;
  answeredAt: Date;
  timeSpent: number;
}

export interface IntervalStats {
  intervalNumber: number;
  startTime: number;
  endTime: number;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number;
}

export interface ResponsesWithIntervals {
  responses: Record<string, GeneratedResponse>;
  intervals: IntervalStats[];
  totalTimeTaken: number;
}

/**
 * Answer Generator for simulating student responses
 * Generates answers with configurable accuracy percentage
 */
export class AnswerGenerator {
  constructor(
    private accuracyPercentage: number,
    private minTimeMs: number = 1000,
    private maxTimeMs: number = 5000
  ) {
    if (accuracyPercentage < 0 || accuracyPercentage > 100) {
      throw new Error('Accuracy percentage must be between 0 and 100');
    }
  }

  /**
   * Generate responses for a list of questions
   * @param questions - Array of questions to answer
   * @returns Record of question ID to response
   */
  generateResponses(questions: Question[]): Record<string, GeneratedResponse> {
    const responses: Record<string, GeneratedResponse> = {};
    const totalQuestions = questions.length;

    // Calculate how many questions should be correct
    const targetCorrect = Math.round((this.accuracyPercentage / 100) * totalQuestions);

    // Randomly select which questions to answer correctly
    const correctIndices = this.selectRandomIndices(totalQuestions, targetCorrect);

    let currentTime = Date.now();

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const shouldBeCorrect = correctIndices.has(i);
      const timeSpent = this.randomTimeSpent();

      const startedAt = new Date(currentTime);
      currentTime += timeSpent;
      const answeredAt = new Date(currentTime);

      // Calculate the correct answer from the expression
      const correctAnswer = evaluateExpression(question.expression);

      // Generate user answer based on whether it should be correct
      const userAnswer = shouldBeCorrect
        ? String(correctAnswer)
        : generateWrongAnswer(correctAnswer);

      responses[question.id] = {
        questionId: question.id,
        userAnswer,
        isCorrect: shouldBeCorrect,
        startedAt,
        answeredAt,
        timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
      };
    }

    return responses;
  }

  /**
   * Select random unique indices from 0 to total-1
   */
  private selectRandomIndices(total: number, count: number): Set<number> {
    const indices = new Set<number>();
    const adjustedCount = Math.min(count, total);

    while (indices.size < adjustedCount) {
      const randomIndex = Math.floor(Math.random() * total);
      indices.add(randomIndex);
    }

    return indices;
  }

  /**
   * Generate random time spent on a question
   */
  private randomTimeSpent(): number {
    return Math.random() * (this.maxTimeMs - this.minTimeMs) + this.minTimeMs;
  }

  /**
   * Get the configured accuracy percentage
   */
  getAccuracyPercentage(): number {
    return this.accuracyPercentage;
  }

  /**
   * Create a new generator with different accuracy
   */
  withAccuracy(accuracyPercentage: number): AnswerGenerator {
    return new AnswerGenerator(accuracyPercentage, this.minTimeMs, this.maxTimeMs);
  }

  /**
   * Generate responses for a list of questions with 7-minute interval tracking
   * This simulates a real practice session where students work in 7-minute intervals
   * @param questions - Array of questions to answer
   * @param intervalDurationSeconds - Duration of each interval in seconds (default: 420 = 7 minutes)
   * @returns Responses with interval statistics
   */
  generateResponsesWithIntervals(
    questions: Question[],
    intervalDurationSeconds: number = 420
  ): ResponsesWithIntervals {
    const responses: Record<string, GeneratedResponse> = {};
    const intervals: IntervalStats[] = [];
    const totalQuestions = questions.length;

    // Calculate how many questions should be correct
    const targetCorrect = Math.round((this.accuracyPercentage / 100) * totalQuestions);
    const correctIndices = this.selectRandomIndices(totalQuestions, targetCorrect);

    let currentTimeSeconds = 0;
    let currentIntervalNumber = 1;
    let intervalStartTime = 0;
    let intervalQuestionsAttempted = 0;
    let intervalCorrect = 0;
    let intervalIncorrect = 0;
    let intervalTotalTime = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const shouldBeCorrect = correctIndices.has(i);
      const timeSpentMs = this.randomTimeSpent();
      const timeSpentSeconds = Math.round(timeSpentMs / 1000);

      const startedAt = new Date(Date.now() + currentTimeSeconds * 1000);
      currentTimeSeconds += timeSpentSeconds;
      const answeredAt = new Date(Date.now() + currentTimeSeconds * 1000);

      // Check if we've exceeded the current interval
      const elapsedInInterval = currentTimeSeconds - intervalStartTime;
      if (elapsedInInterval >= intervalDurationSeconds && i < questions.length - 1) {
        // Save current interval stats
        intervals.push({
          intervalNumber: currentIntervalNumber,
          startTime: intervalStartTime,
          endTime: currentTimeSeconds,
          questionsAttempted: intervalQuestionsAttempted,
          correct: intervalCorrect,
          incorrect: intervalIncorrect,
          avgTimePerQuestion: intervalQuestionsAttempted > 0
            ? Math.round((intervalTotalTime / intervalQuestionsAttempted) * 10) / 10
            : 0,
        });

        // Start new interval
        currentIntervalNumber++;
        intervalStartTime = currentTimeSeconds;
        intervalQuestionsAttempted = 0;
        intervalCorrect = 0;
        intervalIncorrect = 0;
        intervalTotalTime = 0;
      }

      // Calculate the correct answer from the expression
      const correctAnswer = evaluateExpression(question.expression);

      // Generate user answer based on whether it should be correct
      const userAnswer = shouldBeCorrect
        ? String(correctAnswer)
        : generateWrongAnswer(correctAnswer);

      responses[question.id] = {
        questionId: question.id,
        userAnswer,
        isCorrect: shouldBeCorrect,
        startedAt,
        answeredAt,
        timeSpent: timeSpentSeconds,
      };

      // Update interval tracking
      intervalQuestionsAttempted++;
      intervalTotalTime += timeSpentSeconds;
      if (shouldBeCorrect) {
        intervalCorrect++;
      } else {
        intervalIncorrect++;
      }
    }

    // Save the final interval
    if (intervalQuestionsAttempted > 0) {
      intervals.push({
        intervalNumber: currentIntervalNumber,
        startTime: intervalStartTime,
        endTime: currentTimeSeconds,
        questionsAttempted: intervalQuestionsAttempted,
        correct: intervalCorrect,
        incorrect: intervalIncorrect,
        avgTimePerQuestion: intervalQuestionsAttempted > 0
          ? Math.round((intervalTotalTime / intervalQuestionsAttempted) * 10) / 10
          : 0,
      });
    }

    return {
      responses,
      intervals,
      totalTimeTaken: currentTimeSeconds,
    };
  }
}

/**
 * Factory function to create an answer generator from config
 */
export function createAnswerGenerator(
  accuracyPercentage: number,
  minTimeMs?: number,
  maxTimeMs?: number
): AnswerGenerator {
  return new AnswerGenerator(
    accuracyPercentage,
    minTimeMs ?? 1000,
    maxTimeMs ?? 5000
  );
}
