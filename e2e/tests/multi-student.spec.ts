import { test, expect } from '@playwright/test';
import { ApiClient } from '../lib/api-client';
import { AnswerGenerator } from '../lib/answer-generator';
import { loadConfig } from '../lib/config-loader';

/**
 * API-based Multi-Student Simulation Test
 *
 * This test simulates multiple students completing practice sessions
 * using direct API calls for faster execution.
 */
test.describe('Multi-Student API Simulation', () => {
  let config: ReturnType<typeof loadConfig>;

  test.beforeAll(() => {
    try {
      config = loadConfig();
    } catch {
      config = {
        environment: {
          api_url: process.env.API_URL || 'http://localhost:3001/api',
          frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
        test_users: [
          { identifier: process.env.TEST_USER || 'josna@gmail.com', name: 'Test User' },
        ],
        session_config: {
          accuracy_percentage: parseInt(process.env.ACCURACY_PERCENTAGE || '75', 10),
          sessions_per_run: parseInt(process.env.SESSIONS_PER_RUN || '1', 10),
          min_time_per_question_ms: 500,
          max_time_per_question_ms: 1000,
          practice_sheets: ['aa-2'],
        },
        browser_config: {
          headless: true,
          timeout: 30000,
        },
      };
    }
  });

  test('should complete sessions for all configured users', async () => {
    const results: Array<{
      user: string;
      success: boolean;
      score?: number;
      error?: string;
    }> = [];

    for (const user of config.test_users) {
      const client = new ApiClient(config);

      try {
        // Login
        await client.login(user.identifier);

        // Get practice sheets
        let practiceSheets: string[];
        try {
          const sheets = await client.getPracticeSheets();
          practiceSheets = sheets.map((s) => s.id);
        } catch {
          practiceSheets = config.session_config.practice_sheets;
        }

        // Run configured number of sessions
        for (let i = 0; i < config.session_config.sessions_per_run; i++) {
          const sheetId = practiceSheets[i % practiceSheets.length];

          // Generate test
          const testResponse = await client.generateTest('practice', sheetId, user.name);
          const questions = testResponse.test.sections.flatMap((s) => s.questions);

          // Generate responses with configured accuracy
          const answerGen = new AnswerGenerator(
            config.session_config.accuracy_percentage,
            config.session_config.min_time_per_question_ms,
            config.session_config.max_time_per_question_ms
          );
          const responses = answerGen.generateResponses(questions);

          // Submit test
          const timeTaken = Math.round(15 * 60 + Math.random() * 300 - 150);
          const result = await client.submitTest(testResponse.test.id, responses, timeTaken);

          results.push({
            user: user.identifier,
            success: true,
            score: result.result.score,
          });
        }
      } catch (error) {
        results.push({
          user: user.identifier,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log results
    console.log('\n=== Multi-Student Simulation Results ===');
    for (const r of results) {
      if (r.success) {
        console.log(`✓ ${r.user}: Score ${r.score?.toFixed(1)}%`);
      } else {
        console.log(`✗ ${r.user}: ${r.error}`);
      }
    }

    // At least one user should succeed
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBeGreaterThan(0);
  });

  test('should generate data with target accuracy', async () => {
    const client = new ApiClient(config);
    const user = config.test_users[0];
    const targetAccuracy = config.session_config.accuracy_percentage;

    // Login
    await client.login(user.identifier);

    // Get practice sheets
    let sheetId: string;
    try {
      const sheets = await client.getPracticeSheets();
      sheetId = sheets[0]?.id || config.session_config.practice_sheets[0];
    } catch {
      sheetId = config.session_config.practice_sheets[0];
    }

    // Generate test
    const testResponse = await client.generateTest('practice', sheetId, user.name);
    const questions = testResponse.test.sections.flatMap((s) => s.questions);

    // Generate responses
    const answerGen = new AnswerGenerator(targetAccuracy, 500, 1000);
    const responses = answerGen.generateResponses(questions);

    // Count expected correct answers
    const expectedCorrect = Math.round((targetAccuracy / 100) * questions.length);
    const actualCorrect = Object.values(responses).filter((r) => r.isCorrect).length;

    // Should be within reasonable range of target
    expect(actualCorrect).toBeGreaterThanOrEqual(expectedCorrect - 2);
    expect(actualCorrect).toBeLessThanOrEqual(expectedCorrect + 2);

    // Submit and verify
    const timeTaken = 600;
    const result = await client.submitTest(testResponse.test.id, responses, timeTaken);

    console.log(`Target accuracy: ${targetAccuracy}%`);
    console.log(`Actual score: ${result.result.score.toFixed(1)}%`);
    console.log(`Correct: ${result.result.correct}/${result.result.totalQuestions}`);

    // Score should be close to target accuracy
    expect(result.result.score).toBeGreaterThanOrEqual(targetAccuracy - 10);
    expect(result.result.score).toBeLessThanOrEqual(targetAccuracy + 10);
  });
});
