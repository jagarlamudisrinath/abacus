import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Welcome/Home Screen
 */
export class WelcomePage {
  readonly page: Page;
  readonly practiceButton: Locator;
  readonly testButton: Locator;
  readonly practiceSheetGrid: Locator;
  readonly startButton: Locator;
  readonly dashboardButton: Locator;
  readonly logoutButton: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.practiceButton = page.locator('.mode-option:has-text("Practice")');
    this.testButton = page.locator('.mode-option:has-text("Test")');
    this.practiceSheetGrid = page.locator('.practice-sheet-grid, .sheet-list');
    this.startButton = page.locator('.start-btn, button:has-text("Start")');
    this.dashboardButton = page.locator('button:has-text("My Progress")');
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.welcomeMessage = page.locator('.welcome-screen h1, .welcome-header h1');
  }

  /**
   * Select practice or test mode
   */
  async selectMode(mode: 'practice' | 'test'): Promise<void> {
    if (mode === 'practice') {
      await this.practiceButton.click();
    } else {
      await this.testButton.click();
    }
  }

  /**
   * Select a practice sheet by name or ID
   */
  async selectPracticeSheet(sheetNameOrId: string): Promise<void> {
    const sheetButton = this.page.locator(`.sheet-option:has-text("${sheetNameOrId}"), .practice-sheet-option:has-text("${sheetNameOrId}")`).first();
    await sheetButton.click();
  }

  /**
   * Start the test/practice session
   */
  async startTest(): Promise<void> {
    await this.startButton.click();
    await this.page.waitForSelector('.test-interface, .question-display', { timeout: 10000 });
  }

  /**
   * Go to the progress dashboard
   */
  async goToDashboard(): Promise<void> {
    await this.dashboardButton.click();
    await this.page.waitForSelector('.dashboard, .progress-dashboard', { timeout: 10000 });
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForSelector('.login-screen', { timeout: 10000 });
  }

  /**
   * Get the welcome message text
   */
  async getWelcomeMessage(): Promise<string | null> {
    return await this.welcomeMessage.textContent();
  }

  /**
   * Get list of available practice sheets
   */
  async getPracticeSheetOptions(): Promise<string[]> {
    const options = await this.page.locator('.sheet-option, .practice-sheet-option').all();
    const names: string[] = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /**
   * Check if on welcome page
   */
  async isOnWelcomePage(): Promise<boolean> {
    return await this.page.locator('.welcome-screen').isVisible();
  }
}
