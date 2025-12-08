#!/usr/bin/env npx ts-node

/**
 * Test script to generate a practice session with multiple 7-minute intervals
 * This simulates a longer session to ensure interval tracking works correctly
 */

import { ApiClient } from '../lib/api-client';

interface IntervalStats {
  intervalNumber: number;
  startTime: number;
  endTime: number;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number;
}

interface QuestionResponse {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  startedAt: Date;
  answeredAt: Date;
  timeSpent: number;
}

async function runMultiIntervalTest() {
  const apiUrl = 'http://localhost:3001/api';
  const userEmail = 'rishi@gmail.com';
  const practiceSheetId = 'aa-2';

  // Target: 100% accuracy, all questions answered
  const accuracy = 100;

  // Simulate 14+ minutes total (840+ seconds) to get at least 2 intervals
  // With ~66 questions, we need ~13 seconds per question average
  const minTimePerQuestionSec = 10;
  const maxTimePerQuestionSec = 16;

  console.log('='.repeat(60));
  console.log('Multi-Interval Test Session');
  console.log('='.repeat(60));
  console.log(`User: ${userEmail}`);
  console.log(`Practice Sheet: ${practiceSheetId}`);
  console.log(`Target Accuracy: ${accuracy}%`);
  console.log(`Time per question: ${minTimePerQuestionSec}-${maxTimePerQuestionSec} seconds`);
  console.log('='.repeat(60));

  const client = new ApiClient({ environment: { api_url: apiUrl } });

  try {
    // Login
    await client.login(userEmail);
    console.log('\n[1] Logged in successfully');

    // Generate test
    const testResponse = await client.generateTest('practice', practiceSheetId, 'Rishi');
    const questions = testResponse.test.sections.flatMap(s => s.questions);
    console.log(`[2] Generated test with ${questions.length} questions`);

    // Generate responses with timing that creates multiple intervals
    const responses: Record<string, QuestionResponse> = {};
    const intervals: IntervalStats[] = [];

    let currentTimeSeconds = 0;
    let currentIntervalNumber = 1;
    let intervalStartTime = 0;
    let intervalQuestionsAttempted = 0;
    let intervalCorrect = 0;
    let intervalIncorrect = 0;
    let intervalTotalTime = 0;

    const INTERVAL_DURATION = 420; // 7 minutes in seconds

    console.log(`\n[3] Generating responses (simulating ${(questions.length * (minTimePerQuestionSec + maxTimePerQuestionSec) / 2 / 60).toFixed(1)} minutes)...`);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      // Random time between min and max
      const timeSpentSeconds = Math.floor(
        Math.random() * (maxTimePerQuestionSec - minTimePerQuestionSec) + minTimePerQuestionSec
      );

      const startedAt = new Date(Date.now() + currentTimeSeconds * 1000);
      currentTimeSeconds += timeSpentSeconds;
      const answeredAt = new Date(Date.now() + currentTimeSeconds * 1000);

      // Check if we've exceeded the current interval
      const elapsedInInterval = currentTimeSeconds - intervalStartTime;
      if (elapsedInInterval >= INTERVAL_DURATION && i < questions.length - 1) {
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

        console.log(`   Interval ${currentIntervalNumber} completed: ${intervalQuestionsAttempted} questions, ${intervalCorrect} correct`);

        // Start new interval
        currentIntervalNumber++;
        intervalStartTime = currentTimeSeconds;
        intervalQuestionsAttempted = 0;
        intervalCorrect = 0;
        intervalIncorrect = 0;
        intervalTotalTime = 0;
      }

      // Always answer correctly for this test (100% accuracy)
      const userAnswer = String(question.correctAnswer);
      const isCorrect = true;

      responses[question.id] = {
        questionId: question.id,
        userAnswer,
        isCorrect,
        startedAt,
        answeredAt,
        timeSpent: timeSpentSeconds,
      };

      // Update interval tracking
      intervalQuestionsAttempted++;
      intervalTotalTime += timeSpentSeconds;
      if (isCorrect) {
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
      console.log(`   Interval ${currentIntervalNumber} completed: ${intervalQuestionsAttempted} questions, ${intervalCorrect} correct`);
    }

    console.log(`\n[4] Generated ${intervals.length} intervals over ${(currentTimeSeconds / 60).toFixed(1)} minutes`);

    // Display interval summary
    console.log('\nInterval Summary:');
    for (const interval of intervals) {
      const duration = interval.endTime - interval.startTime;
      console.log(`   Interval ${interval.intervalNumber}: ${(duration / 60).toFixed(1)}min, ${interval.questionsAttempted} questions, ${interval.correct} correct, ${interval.avgTimePerQuestion}s avg`);
    }

    // Submit test with intervals
    console.log('\n[5] Submitting test to backend...');
    const result = await client.submitTest(testResponse.test.id, responses, currentTimeSeconds, intervals);

    console.log('\n[6] Test submitted successfully!');
    console.log(`   Score: ${result.result.score.toFixed(1)}%`);
    console.log(`   Correct: ${result.result.correct}/${result.result.totalQuestions}`);
    console.log(`   Time: ${(result.result.timeTaken / 60).toFixed(1)} minutes`);

    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS: Multi-interval session created!');
    console.log('='.repeat(60));
    console.log('\nNow go to the dashboard and check the session detail to verify');
    console.log('the 7-minute breakdown shows multiple intervals.');

  } catch (error) {
    console.error('\nERROR:', error);
    process.exit(1);
  }
}

runMultiIntervalTest();
