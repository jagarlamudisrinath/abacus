import { Test, TestMode, Response, TestResult, PracticeSheet } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
  timeTaken: number
): Promise<TestResult> {
  const response = await fetch(`${API_BASE}/test/${testId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      testId,
      responses,
      timeTaken,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit test');
  }

  const data = await response.json();
  return data.result;
}
