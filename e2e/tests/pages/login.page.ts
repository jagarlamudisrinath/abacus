import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Login Screen
 */
export class LoginPage {
  readonly page: Page;
  readonly identifierInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly adminLink: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.identifierInput = page.locator('#identifier');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.login-error');
    this.adminLink = page.locator('.admin-link');
    this.logo = page.locator('.login-logo');
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Login with the given identifier
   */
  async login(identifier: string): Promise<void> {
    await this.identifierInput.fill(identifier);
    await this.submitButton.click();
    // Wait for navigation to welcome screen
    await this.page.waitForSelector('.welcome-screen, .login-error', { timeout: 10000 });
  }

  /**
   * Check if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.locator('.welcome-screen').isVisible();
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Click on admin panel link
   */
  async goToAdminPanel(): Promise<void> {
    await this.adminLink.click();
  }

  /**
   * Check if on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return await this.logo.isVisible();
  }
}
