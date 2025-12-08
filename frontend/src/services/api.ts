import { Test, TestMode, Response, TestResult, PracticeSheet, IntervalStats } from '../types';
import { API_BASE } from '../config/api.config';

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function getHeaders(includeAuth: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function getPracticeSheets(): Promise<PracticeSheet[]> {
  const response = await fetch(`${API_BASE}/test/practice-sheets`);

  if (!response.ok) {
    throw new Error('Failed to get practice sheets');
  }

  const data = await response.json();
  return data.sheets;
}

export async function generateTest(
  mode: TestMode,
  practiceSheetId: string,
  candidateName: string
): Promise<Test> {
  const response = await fetch(`${API_BASE}/test/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      mode,
      practiceSheetId,
      candidateName,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate test');
  }

  const data = await response.json();
  return data.test;
}

export async function getTest(testId: string): Promise<{ test: Test; responses: Record<string, Response> }> {
  const response = await fetch(`${API_BASE}/test/${testId}`);

  if (!response.ok) {
    throw new Error('Failed to get test');
  }

  return response.json();
}

export async function saveProgress(
  testId: string,
  responses: Record<string, Response>,
  currentSectionIndex: number,
  currentQuestionIndex: number
): Promise<{ success: boolean; savedAt: Date }> {
  const response = await fetch(`${API_BASE}/test/${testId}/save`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      testId,
      responses,
      currentSectionIndex,
      currentQuestionIndex,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save progress');
  }

  return response.json();
}

export async function submitTest(
  testId: string,
  responses: Record<string, Response>,
  timeTaken: number,
  intervals?: IntervalStats[]
): Promise<TestResult> {
  const response = await fetch(`${API_BASE}/test/${testId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      testId,
      responses,
      timeTaken,
      intervals,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit test');
  }

  const data = await response.json();
  return data.result;
}
