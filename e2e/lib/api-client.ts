import axios, { AxiosInstance } from 'axios';
import { TestConfig } from './config-loader';

export interface LoginResponse {
  token: string;
  student: {
    id: string;
    email: string | null;
    studentId: string | null;
    name: string;
    role: string;
  };
  isNewUser: boolean;
}

export interface Question {
  id: string;
  questionNumber: number;
  expression: string;
  correctAnswer: number;
}

export interface Section {
  id: string;
  name: string;
  type: string;
  questions: Question[];
}

export interface GenerateTestResponse {
  test: {
    id: string;
    name: string;
    mode: 'practice' | 'test';
    practiceSheetId: string;
    sections: Section[];
    totalQuestions: number;
  };
}

export interface SubmitTestResponse {
  result: {
    testId: string;
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    score: number;
    timeTaken: number;
  };
}

export interface PracticeSheet {
  id: string;
  name: string;
  questionCount: number;
}

export interface QuestionResponse {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  startedAt?: Date;
  answeredAt?: Date;
  timeSpent?: number;
}

export interface IntervalStats {
  intervalNumber: number;
  startTime: number;
  endTime: number;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  avgTimePerQuestion: number;
}

/**
 * API Client for interacting with Alama Abacus backend
 */
export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private currentUser: LoginResponse['student'] | null = null;

  constructor(private config: TestConfig | { environment: { api_url: string } }) {
    this.client = axios.create({
      baseURL: config.environment.api_url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Login with identifier (email or student ID)
   */
  async login(identifier: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', {
      identifier,
    });
    this.token = response.data.token;
    this.currentUser = response.data.student;
    return response.data;
  }

  /**
   * Get list of available practice sheets
   */
  async getPracticeSheets(): Promise<PracticeSheet[]> {
    const response = await this.client.get<{ practiceSheets: PracticeSheet[] }>(
      '/test/practice-sheets',
      { headers: this.getAuthHeaders() }
    );
    return response.data.practiceSheets;
  }

  /**
   * Generate a new test/practice session
   */
  async generateTest(
    mode: 'practice' | 'test',
    practiceSheetId: string,
    candidateName: string
  ): Promise<GenerateTestResponse> {
    const response = await this.client.post<GenerateTestResponse>(
      '/test/generate',
      { mode, practiceSheetId, candidateName },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Submit completed test with responses
   */
  async submitTest(
    testId: string,
    responses: Record<string, QuestionResponse>,
    timeTaken: number,
    intervals?: IntervalStats[]
  ): Promise<SubmitTestResponse> {
    const payload: {
      testId: string;
      responses: Record<string, QuestionResponse>;
      timeTaken: number;
      intervals?: IntervalStats[];
    } = { testId, responses, timeTaken };

    if (intervals && intervals.length > 0) {
      payload.intervals = intervals;
    }

    const response = await this.client.post<SubmitTestResponse>(
      `/test/${testId}/submit`,
      payload,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * Get dashboard data including stats
   */
  async getDashboard(): Promise<any> {
    const response = await this.client.get('/progress/dashboard', {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Get current user info
   */
  getCurrentUser(): LoginResponse['student'] | null {
    return this.currentUser;
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Clear authentication
   */
  logout(): void {
    this.token = null;
    this.currentUser = null;
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }
}
