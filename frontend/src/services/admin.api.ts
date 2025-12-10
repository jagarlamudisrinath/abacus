import {
  DashboardData,
  SessionSummary,
  SessionDetail,
} from './progress.api';
import { API_BASE } from '../config/api.config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface PracticeSheetSummary {
  id: string;
  name: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  questionNumber: number;
  expression: string;
  answer: number;
}

export interface PracticeSheetDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface BulkParseResult {
  questions: Array<{ expression: string; answer: number }>;
  count: number;
}

export interface StudentSummary {
  id: string;
  email: string | null;
  studentId: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  grade: string | null;
  role: 'student' | 'teacher';
  teacherId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  hasPassword?: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// =====================================
// Practice Sheets API
// =====================================

export async function fetchPracticeSheets(): Promise<PracticeSheetSummary[]> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PracticeSheetSummary[]>(response);
}

export async function fetchPracticeSheet(id: string): Promise<PracticeSheetDetail> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PracticeSheetDetail>(response);
}

export async function createPracticeSheet(data: {
  id?: string;
  name: string;
  questions?: Array<{ expression: string; answer: number }>;
}): Promise<PracticeSheetDetail> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PracticeSheetDetail>(response);
}

export async function updatePracticeSheet(
  id: string,
  data: { name: string }
): Promise<{ id: string; name: string; updatedAt: string }> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deletePracticeSheet(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function addQuestions(
  sheetId: string,
  data: {
    questions?: Array<{ expression: string; answer: number }>;
    bulkText?: string;
    replace?: boolean;
  }
): Promise<{ success: boolean; questionsAdded: number }> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/${sheetId}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateQuestion(
  sheetId: string,
  questionNumber: number,
  data: { expression: string; answer: number }
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE}/admin/practice-sheets/${sheetId}/questions/${questionNumber}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
}

export async function deleteQuestion(
  sheetId: string,
  questionNumber: number
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE}/admin/practice-sheets/${sheetId}/questions/${questionNumber}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function parseBulkText(bulkText: string): Promise<BulkParseResult> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/parse-bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bulkText }),
  });
  return handleResponse(response);
}

export async function scrapeGoogleForm(url: string): Promise<BulkParseResult> {
  const response = await fetch(`${API_BASE}/admin/practice-sheets/scrape-google-form`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ url }),
  });
  return handleResponse(response);
}

export async function exportPracticeSheetQuestions(
  sheetId: string,
  format: 'csv' | 'tsv' = 'csv'
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/admin/practice-sheets/${sheetId}/export?format=${format}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to export questions');
  }

  // Trigger file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sheetId}-questions.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// =====================================
// Student Management API
// =====================================

export async function fetchStudents(): Promise<StudentSummary[]> {
  const response = await fetch(`${API_BASE}/admin/students`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<StudentSummary[]>(response);
}

export async function createStudent(data: {
  firstName: string;
  lastName: string;
  grade?: string;
  email?: string;
}): Promise<StudentSummary> {
  const response = await fetch(`${API_BASE}/admin/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<StudentSummary>(response);
}

export async function updateStudent(
  id: string,
  data: { firstName?: string; lastName?: string; grade?: string; email?: string }
): Promise<StudentSummary> {
  const response = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<StudentSummary>(response);
}

export async function deleteStudent(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/admin/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function setStudentPassword(
  studentId: string,
  password: string,
  forcePasswordChange: boolean = true
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/admin/students/${studentId}/set-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password, forcePasswordChange }),
  });
  return handleResponse(response);
}

// =====================================
// Student Progress/Activity API
// =====================================

export async function fetchStudentDashboard(studentId: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/admin/students/${studentId}/dashboard`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<DashboardData>(response);
}

export async function fetchStudentSessions(
  studentId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ sessions: SessionSummary[]; total: number }> {
  const response = await fetch(
    `${API_BASE}/admin/students/${studentId}/sessions?limit=${limit}&offset=${offset}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function fetchStudentSessionDetail(
  studentId: string,
  sessionId: string
): Promise<SessionDetail> {
  const response = await fetch(
    `${API_BASE}/admin/students/${studentId}/sessions/${sessionId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<SessionDetail>(response);
}

export interface ClassComparisonStats {
  classAverageScore: number;
  classAverageTime: number;
  totalStudentsAttempted: number;
  studentRank: number;
  scoreDiff: number;
  timeDiff: number;
}

export async function fetchClassComparisonStats(
  studentId: string,
  sessionId: string
): Promise<ClassComparisonStats> {
  const response = await fetch(
    `${API_BASE}/admin/students/${studentId}/sessions/${sessionId}/class-comparison`,
    {
      headers: getAuthHeaders(),
    }
  );
  return handleResponse<ClassComparisonStats>(response);
}
