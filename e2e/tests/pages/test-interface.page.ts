import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Test/Practice Interface
 */
export class TestInterfacePage {
  readonly page: Page;
  readonly questionDisplay: Locator;
  readonly expressionDisplay: Locator;
  readonly responseInput: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly timer: Locator;
  readonly questionNumber: Locator;
  readonly saveButton: Locator;
  readonly saveAndCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.questionDisplay = page.locator('.question-display');
    this.expressionDisplay = page.locator('.question-expression, .expression');
    this.responseInput = page.locator('.response-input input, input[placeholder*="answer"]');
    this.nextButton = page.locator('button:has-text("Next"), .side-nav-arrow.right');
    this.prevButton = page.locator('button:has-text("Previous"), .side-nav-arrow.left');
    this.timer = page.locator('.timer, .time-display');
    this.questionNumber = page.locator('.question-number');
    this.saveButton = page.locator('button:has-text("Save")').first();
    this.saveAndCloseButton = page.locator('button:has-text("Save and Close")');
  }

  /**
   * Get the current expression to solve
   */
  async getCurrentExpression(): Promise<string> {
    const text = await this.expressionDisplay.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the current question number
   */
  async getCurrentQuestionNumber(): Promise<string> {
    const text = await this.questionNumber.textContent();
    return text?.trim() || '';
  }

  /**
   * Enter an answer for the current question
   */
  async enterAnswer(answer: string): Promise<void> {
    await this.responseInput.fill(answer);
  }

  /**
   * Submit current answer and go to next question
   */
  async submitAndNext(): Promise<void> {
    await this.responseInput.press('Enter');
    // Small delay to allow state update
    await this.page.waitForTimeout(200);
  }

  /**
   * Go to the next question
   */
  async goToNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Go to the previous question
   */
  async goToPrevious(): Promise<void> {
    await this.prevButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if currently on the results screen
   */
  async isOnResultsScreen(): Promise<boolean> {
    return await this.page.locator('.results-screen, .result-container').isVisible();
  }

  /**
   * Save progress
   */
  async saveProgress(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Save and close the test
   */
  async saveAndClose(): Promise<void> {
    await this.saveAndCloseButton.click();
    await this.page.waitForSelector('.results-screen, .welcome-screen', { timeout: 10000 });
  }

  /**
   * Answer multiple questions
   */
  async answerQuestions(answers: string[], maxQuestions?: number): Promise<void> {
    const limit = maxQuestions ?? answers.length;
    for (let i = 0; i < Math.min(limit, answers.length); i++) {
      await this.enterAnswer(answers[i]);
      await this.submitAndNext();

      // Check if we've reached the results screen
      if (await this.isOnResultsScreen()) {
        break;
      }
    }
  }

  /**
   * Get the current timer value
   */
  async getTimerValue(): Promise<string> {
    const text = await this.timer.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if on test interface page
   */
  async isOnTestInterface(): Promise<boolean> {
    return await this.questionDisplay.isVisible();
  }
}
