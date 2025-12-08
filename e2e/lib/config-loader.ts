import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export interface TestUser {
  identifier: string;
  name: string;
}

export interface SessionConfig {
  accuracy_percentage: number;
  sessions_per_run: number;
  min_time_per_question_ms: number;
  max_time_per_question_ms: number;
  practice_sheets: string[];
}

export interface BrowserConfig {
  headless: boolean;
  timeout: number;
}

export interface TestConfig {
  environment: {
    api_url: string;
    frontend_url: string;
  };
  test_users: TestUser[];
  session_config: SessionConfig;
  browser_config: BrowserConfig;
}

/**
 * Load configuration from YAML file with environment variable overrides
 * @param configPath - Optional path to config file
 * @returns Loaded and validated configuration
 */
export function loadConfig(configPath?: string): TestConfig {
  const defaultPath = path.join(__dirname, '../config/test-config.yaml');
  const filePath = configPath || process.env.E2E_CONFIG_PATH || defaultPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const config = yaml.parse(content) as TestConfig;

  // Apply environment variable overrides
  if (process.env.API_URL) {
    config.environment.api_url = process.env.API_URL;
  }
  if (process.env.FRONTEND_URL) {
    config.environment.frontend_url = process.env.FRONTEND_URL;
  }
  if (process.env.ACCURACY_PERCENTAGE) {
    config.session_config.accuracy_percentage = parseInt(process.env.ACCURACY_PERCENTAGE, 10);
  }
  if (process.env.SESSIONS_PER_RUN) {
    config.session_config.sessions_per_run = parseInt(process.env.SESSIONS_PER_RUN, 10);
  }
  if (process.env.TEST_USERS) {
    // Parse comma-separated user identifiers
    const identifiers = process.env.TEST_USERS.split(',').map(s => s.trim());
    config.test_users = identifiers.map(identifier => ({
      identifier,
      name: identifier.split('@')[0] || identifier,
    }));
  }

  // Validate config
  validateConfig(config);

  return config;
}

/**
 * Validate configuration values
 */
function validateConfig(config: TestConfig): void {
  if (!config.environment?.api_url) {
    throw new Error('Config error: environment.api_url is required');
  }
  if (!config.environment?.frontend_url) {
    throw new Error('Config error: environment.frontend_url is required');
  }
  if (!config.test_users || config.test_users.length === 0) {
    throw new Error('Config error: at least one test_user is required');
  }
  if (config.session_config.accuracy_percentage < 0 || config.session_config.accuracy_percentage > 100) {
    throw new Error('Config error: accuracy_percentage must be between 0 and 100');
  }
  if (config.session_config.sessions_per_run < 1) {
    throw new Error('Config error: sessions_per_run must be at least 1');
  }
  if (!config.session_config.practice_sheets || config.session_config.practice_sheets.length === 0) {
    throw new Error('Config error: at least one practice_sheet is required');
  }
}

/**
 * Get default configuration for testing purposes
 */
export function getDefaultConfig(): TestConfig {
  return {
    environment: {
      api_url: 'http://localhost:3001/api',
      frontend_url: 'http://localhost:3000',
    },
    test_users: [
      { identifier: 'test@example.com', name: 'Test User' },
    ],
    session_config: {
      accuracy_percentage: 75,
      sessions_per_run: 1,
      min_time_per_question_ms: 500,
      max_time_per_question_ms: 2000,
      practice_sheets: ['aa-practice-sheet-2'],
    },
    browser_config: {
      headless: true,
      timeout: 30000,
    },
  };
}
