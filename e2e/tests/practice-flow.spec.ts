import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { WelcomePage } from './pages/welcome.page';
import { TestInterfacePage } from './pages/test-interface.page';
import { DashboardPage } from './pages/dashboard.page';
import { evaluateExpression } from '../lib/expression-parser';
import { loadConfig } from '../lib/config-loader';

/**
 * E2E Test: Complete Practice Session Flow
 *
 * Tests the full flow of:
 * 1. Login
 * 2. Select practice mode and sheet
 * 3. Answer questions
 * 4. View results
 */
test.describe('Practice Session Flow', () => {
  let config: ReturnType<typeof loadConfig>;

  test.beforeAll(() => {
    try {
      config = loadConfig();
    } catch {
      // Use defaults if config not found
      config = {
        environment: {
          api_url: process.env.API_URL || 'http://localhost:3001/api',
          frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
        },
        test_users: [
          { identifier: process.env.TEST_USER || 'josna@gmail.com', name: 'Test User' },
        ],
        session_config: {
          accuracy_percentage: 75,
          sessions_per_run: 1,
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

  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testUser = config.test_users[0];

    await loginPage.goto();
    await expect(loginPage.logo).toBeVisible();

    await loginPage.login(testUser.identifier);

    // Should be on welcome screen after login
    await expect(page.locator('.welcome-screen')).toBeVisible();
  });

  test('should start and complete a practice session', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const welcomePage = new WelcomePage(page);
    const testInterfacePage = new TestInterfacePage(page);
    const testUser = config.test_users[0];

    // Login
    await loginPage.goto();
    await loginPage.login(testUser.identifier);

    // Should be on welcome screen
    await expect(page.locator('.welcome-screen')).toBeVisible();

    // Select practice mode (it might already be selected)
    try {
      await welcomePage.selectMode('practice');
    } catch {
      // Mode might already be selected
    }

    // Start practice
    await welcomePage.startTest();

    // Should be on test interface
    await expect(testInterfacePage.questionDisplay).toBeVisible();

    // Get and answer the first question correctly
    const expression = await testInterfacePage.getCurrentExpression();
    expect(expression).toBeTruthy();

    const correctAnswer = evaluateExpression(expression);
    await testInterfacePage.enterAnswer(String(correctAnswer));
    await testInterfacePage.submitAndNext();

    // Answer a few more questions
    for (let i = 0; i < 4; i++) {
      const expr = await testInterfacePage.getCurrentExpression();
      if (!expr) break;

      const answer = evaluateExpression(expr);
      await testInterfacePage.enterAnswer(String(answer));
      await testInterfacePage.submitAndNext();

      // Check if we've reached results
      if (await testInterfacePage.isOnResultsScreen()) {
        break;
      }
    }
  });

  test('should show progress on dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const welcomePage = new WelcomePage(page);
    const dashboardPage = new DashboardPage(page);
    const testUser = config.test_users[0];

    // Login
    await loginPage.goto();
    await loginPage.login(testUser.identifier);

    // Go to dashboard
    await welcomePage.goToDashboard();
    await dashboardPage.waitForLoad();

    // Should show some stats
    await expect(dashboardPage.badgesSection).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const welcomePage = new WelcomePage(page);
    const testUser = config.test_users[0];

    // Login
    await loginPage.goto();
    await loginPage.login(testUser.identifier);

    // Logout
    await welcomePage.logout();

    // Should be back on login screen
    await expect(loginPage.logo).toBeVisible();
  });
});
