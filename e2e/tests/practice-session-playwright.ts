#!/usr/bin/env npx ts-node

/**
 * Playwright test to simulate a real student completing a practice session
 * This test will answer all questions through the UI like a real student
 */

import { chromium, Browser, Page } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const USER_EMAIL = 'rishi@gmail.com';

function calculateAnswer(expression: string): number {
  // Clean the expression - handle special minus signs and spaces
  const cleaned = expression
    .replace(/\s/g, '')
    .replace(/−/g, '-')
    .replace(/–/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  try {
    return Function(`"use strict"; return (${cleaned})`)();
  } catch {
    console.log(`Could not evaluate: ${expression}`);
    return 0;
  }
}

async function runPracticeSession() {
  console.log('='.repeat(60));
  console.log('Playwright Practice Session Simulation');
  console.log('='.repeat(60));

  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // 1. Navigate to the app
    console.log('\n[1] Navigating to app...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 2. Check if we need to login
    const loginInput = page.getByPlaceholder('Enter your email or student ID');
    if (await loginInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('[2] Logging in...');
      await loginInput.fill(USER_EMAIL);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } else {
      console.log('[2] Already logged in');
    }

    // 3. Wait for welcome screen
    await page.waitForSelector('text=Welcome', { timeout: 5000 });
    console.log('[3] On welcome screen');

    // 4. Select Practice mode and Practice Sheet 2
    const practiceButton = page.getByRole('button', { name: /Practice.*No time limit/i });
    if (await practiceButton.isVisible()) {
      await practiceButton.click();
    }

    const sheet2Button = page.getByRole('button', { name: /AA Practice Sheet 2.*66 questions/ });
    if (await sheet2Button.isVisible()) {
      await sheet2Button.click();
      console.log('[4] Selected AA Practice Sheet 2');
    }

    // 5. Start Practice
    await page.getByRole('button', { name: 'Start Practice' }).click();
    await page.waitForSelector('text=Question 1', { timeout: 5000 });
    console.log('[5] Started practice session');

    // 6. Answer all 66 questions
    const totalQuestions = 66;
    const startTime = Date.now();

    for (let q = 1; q <= totalQuestions; q++) {
      // Wait for question to load
      await page.waitForSelector(`h1:has-text("Question ${q}")`, { timeout: 5000 });

      // Get the expression - look for the element that contains the math expression
      let expression = '';

      // Try multiple selectors to find the expression
      const selectors = [
        '.question-expression',
        '[class*="expression"]',
        'main >> text=/^[\\d+\\-×÷\\s]+$/'
      ];

      for (const selector of selectors) {
        try {
          const el = page.locator(selector).first();
          if (await el.isVisible({ timeout: 500 })) {
            expression = await el.textContent() || '';
            if (expression && /[\d+\-]/.test(expression)) {
              break;
            }
          }
        } catch {
          // Try next selector
        }
      }

      // If still no expression, get it from the page content
      if (!expression) {
        const mainContent = await page.locator('main').textContent();
        // Look for pattern like "5+2-6+8"
        const match = mainContent?.match(/(\d+[\+\-]\d+(?:[\+\-]\d+)*)/);
        if (match) {
          expression = match[1];
        }
      }

      const answer = calculateAnswer(expression);

      // Type the answer
      const inputBox = page.getByPlaceholder('Type your answer...');
      await inputBox.fill(String(answer));

      // Add delay between questions (300-800ms for speed)
      const delay = 300 + Math.random() * 500;
      await page.waitForTimeout(delay);

      if (q % 10 === 0 || q === totalQuestions) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`   [Progress] ${q}/${totalQuestions} questions (${elapsed}s elapsed) - Last: ${expression} = ${answer}`);
      }

      // Click Next Question (unless it's the last question)
      if (q < totalQuestions) {
        await page.getByRole('button', { name: 'Next Question' }).click();
        await page.waitForTimeout(100);
      }
    }

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(`\n[6] Answered all ${totalQuestions} questions in ${totalTime}s`);

    // 7. Submit the test
    console.log('[7] Submitting test...');

    // Look for Submit button in the footer or navigation
    const submitButton = page.getByRole('button', { name: /Submit|Finish|Complete/i });
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitButton.click();
    } else {
      // Try "Save and Close" button
      const saveAndCloseButton = page.getByRole('button', { name: 'Save and Close' });
      await saveAndCloseButton.click();
    }

    await page.waitForTimeout(3000);

    // Take a screenshot
    await page.screenshot({ path: '/Users/srinathjagarlamudi/Documents/codebase/alama_abacus/e2e/practice-session-result.png', fullPage: true });
    console.log('[8] Screenshot saved');

    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS: Practice session completed!');
    console.log(`Total time: ${totalTime} seconds`);
    console.log('='.repeat(60));

    // Keep browser open for 5 seconds to see results
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error during practice session:', error);
    await page.screenshot({ path: '/Users/srinathjagarlamudi/Documents/codebase/alama_abacus/e2e/practice-session-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
runPracticeSession().catch(console.error);
