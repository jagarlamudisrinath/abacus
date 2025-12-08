#!/usr/bin/env npx ts-node

/**
 * Data Seeder for Alama Abacus
 *
 * Generates practice session data by simulating multiple students
 * taking practice sessions with configurable accuracy.
 *
 * Usage:
 *   npx ts-node seeder.ts
 *   npx ts-node seeder.ts --sessions 5 --accuracy 80
 *   npx ts-node seeder.ts --users "user1@test.com,user2@test.com"
 */

import { loadConfig, TestConfig } from '../lib/config-loader';
import { ApiClient } from '../lib/api-client';
import { AnswerGenerator } from '../lib/answer-generator';

interface SeederOptions {
  configPath?: string;
  usersOverride?: string[];
  sessionsOverride?: number;
  accuracyOverride?: number;
}

interface SessionResult {
  user: string;
  sessionIndex: number;
  sheetId: string;
  score: number;
  correct: number;
  total: number;
  success: boolean;
  error?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): SeederOptions {
  const args = process.argv.slice(2);
  const options: SeederOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
        options.configPath = args[++i];
        break;
      case '--sessions':
        options.sessionsOverride = parseInt(args[++i], 10);
        break;
      case '--accuracy':
        options.accuracyOverride = parseInt(args[++i], 10);
        break;
      case '--users':
        options.usersOverride = args[++i].split(',').map((s) => s.trim());
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Alama Abacus Data Seeder

Usage: npx ts-node seeder.ts [options]

Options:
  --config <path>     Path to config file (default: ../config/test-config.yaml)
  --sessions <n>      Number of sessions per user (overrides config)
  --accuracy <n>      Target accuracy percentage 0-100 (overrides config)
  --users <list>      Comma-separated user identifiers (overrides config)
  --help, -h          Show this help message

Examples:
  npx ts-node seeder.ts
  npx ts-node seeder.ts --sessions 5 --accuracy 80
  npx ts-node seeder.ts --users "student1@test.com,student2@test.com"
`);
}

/**
 * Main seeder function
 */
async function runSeeder(options: SeederOptions = {}): Promise<SessionResult[]> {
  let config: TestConfig;

  try {
    config = loadConfig(options.configPath);
  } catch (error) {
    console.error('Failed to load config:', error);
    process.exit(1);
  }

  // Apply overrides
  const users = options.usersOverride || config.test_users.map((u) => u.identifier);
  const sessionsPerRun = options.sessionsOverride ?? config.session_config.sessions_per_run;
  const accuracy = options.accuracyOverride ?? config.session_config.accuracy_percentage;
  const practiceSheets = config.session_config.practice_sheets;

  console.log('='.repeat(60));
  console.log('Alama Abacus Data Seeder');
  console.log('='.repeat(60));
  console.log(`API URL: ${config.environment.api_url}`);
  console.log(`Users: ${users.length}`);
  console.log(`Sessions per user: ${sessionsPerRun}`);
  console.log(`Target accuracy: ${accuracy}%`);
  console.log(`Practice sheets: ${practiceSheets.join(', ')}`);
  console.log('='.repeat(60));

  const results: SessionResult[] = [];

  for (const userIdentifier of users) {
    const userConfig = config.test_users.find((u) => u.identifier === userIdentifier);
    const userName = userConfig?.name || userIdentifier.split('@')[0] || userIdentifier;

    console.log(`\n[User] ${userName} (${userIdentifier})`);

    const client = new ApiClient(config);

    try {
      // Login
      await client.login(userIdentifier);
      console.log('  ✓ Logged in successfully');

      // Get available practice sheets
      let availableSheets: string[];
      try {
        const sheets = await client.getPracticeSheets();
        availableSheets = sheets.map((s) => s.id);
        console.log(`  ✓ Found ${sheets.length} practice sheets`);
      } catch {
        // Fallback to config sheets
        availableSheets = practiceSheets;
        console.log('  ⚠ Using config practice sheets');
      }

      // Run sessions
      for (let sessionNum = 0; sessionNum < sessionsPerRun; sessionNum++) {
        // Cycle through practice sheets
        const sheetIndex = sessionNum % availableSheets.length;
        const sheetId = availableSheets[sheetIndex];

        console.log(`\n  [Session ${sessionNum + 1}/${sessionsPerRun}] ${sheetId}`);

        try {
          // Generate test
          const testResponse = await client.generateTest('practice', sheetId, userName);
          const questions = testResponse.test.sections.flatMap((s) => s.questions);
          console.log(`    ✓ Generated test with ${questions.length} questions`);

          // Generate responses with configured accuracy and 7-minute interval tracking
          const answerGen = new AnswerGenerator(
            accuracy,
            config.session_config.min_time_per_question_ms,
            config.session_config.max_time_per_question_ms
          );
          const { responses, intervals, totalTimeTaken } = answerGen.generateResponsesWithIntervals(questions);

          // Submit test with intervals
          const result = await client.submitTest(testResponse.test.id, responses, totalTimeTaken, intervals);
          console.log(`    ✓ Generated ${intervals.length} interval(s) for 7-minute breakdown`);

          results.push({
            user: userIdentifier,
            sessionIndex: sessionNum,
            sheetId,
            score: result.result.score,
            correct: result.result.correct,
            total: result.result.totalQuestions,
            success: true,
          });

          console.log(
            `    ✓ Submitted: Score ${result.result.score.toFixed(1)}% ` +
              `(${result.result.correct}/${result.result.totalQuestions})`
          );
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          results.push({
            user: userIdentifier,
            sessionIndex: sessionNum,
            sheetId,
            score: 0,
            correct: 0,
            total: 0,
            success: false,
            error: errorMsg,
          });
          console.log(`    ✗ FAILED: ${errorMsg}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ Login failed: ${errorMsg}`);

      // Add failed results for all planned sessions
      for (let i = 0; i < sessionsPerRun; i++) {
        results.push({
          user: userIdentifier,
          sessionIndex: i,
          sheetId: 'N/A',
          score: 0,
          correct: 0,
          total: 0,
          success: false,
          error: `Login failed: ${errorMsg}`,
        });
      }
    }
  }

  // Print summary
  printSummary(results);

  return results;
}

function printSummary(results: SessionResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`Total sessions attempted: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (successful.length > 0) {
    const avgScore = successful.reduce((sum, r) => sum + r.score, 0) / successful.length;
    const totalCorrect = successful.reduce((sum, r) => sum + r.correct, 0);
    const totalQuestions = successful.reduce((sum, r) => sum + r.total, 0);

    console.log(`Average score: ${avgScore.toFixed(1)}%`);
    console.log(`Total questions answered: ${totalQuestions}`);
    console.log(`Total correct: ${totalCorrect}`);
  }

  if (failed.length > 0) {
    console.log('\nFailed sessions:');
    for (const f of failed) {
      console.log(`  - ${f.user} session ${f.sessionIndex + 1}: ${f.error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

// CLI entry point
if (require.main === module) {
  const options = parseArgs();

  runSeeder(options)
    .then((results) => {
      const allSuccess = results.every((r) => r.success);
      process.exit(allSuccess ? 0 : 1);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}

export { runSeeder, SeederOptions, SessionResult };
