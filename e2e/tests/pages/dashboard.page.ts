import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Dashboard/Progress Screen
 */
export class DashboardPage {
  readonly page: Page;
  readonly totalSessionsDisplay: Locator;
  readonly accuracyDisplay: Locator;
  readonly streakDisplay: Locator;
  readonly badgesSection: Locator;
  readonly recentSessionsList: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalSessionsDisplay = page.locator('.stat-value:near(:text("Sessions")), .total-sessions');
    this.accuracyDisplay = page.locator('.stat-value:near(:text("Accuracy")), .overall-accuracy');
    this.streakDisplay = page.locator('.streak-display, .streak-days');
    this.badgesSection = page.locator('.achievement-badges, .badges-section');
    this.recentSessionsList = page.locator('.recent-sessions, .session-list');
    this.backButton = page.locator('button:has-text("Back"), .back-button');
  }

  /**
   * Get total number of sessions
   */
  async getTotalSessions(): Promise<number> {
    const text = await this.totalSessionsDisplay.textContent();
    return parseInt(text?.trim() || '0', 10);
  }

  /**
   * Get overall accuracy percentage
   */
  async getAccuracy(): Promise<number> {
    const text = await this.accuracyDisplay.textContent();
    const match = text?.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get current streak days
   */
  async getStreakDays(): Promise<number> {
    const text = await this.streakDisplay.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get number of unlocked badges
   */
  async getUnlockedBadgesCount(): Promise<number> {
    const unlockedBadges = await this.page.locator('.badge.unlocked').count();
    return unlockedBadges;
  }

  /**
   * Get total badges count
   */
  async getTotalBadgesCount(): Promise<number> {
    const totalBadges = await this.page.locator('.badge').count();
    return totalBadges;
  }

  /**
   * Get list of unlocked badge names
   */
  async getUnlockedBadgeNames(): Promise<string[]> {
    const badges = await this.page.locator('.badge.unlocked .badge-name').all();
    const names: string[] = [];
    for (const badge of badges) {
      const text = await badge.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /**
   * Go back to welcome screen
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForSelector('.welcome-screen', { timeout: 10000 });
  }

  /**
   * Check if on dashboard page
   */
  async isOnDashboard(): Promise<boolean> {
    return await this.badgesSection.isVisible() || await this.totalSessionsDisplay.isVisible();
  }

  /**
   * Wait for dashboard to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForSelector('.dashboard, .progress-dashboard', { timeout: 10000 });
    // Wait for stats to load
    await this.page.waitForTimeout(500);
  }
}
