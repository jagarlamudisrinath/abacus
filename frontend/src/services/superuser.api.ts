import { API_BASE } from '../config/api.config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface TeacherSummary {
  id: string;
  email: string | null;
  name: string;
  createdAt: string;
  lastLoginAt: string | null;
  studentCount: number;
}

export interface StudentWithTeacher {
  id: string;
  studentId: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  grade: string | null;
  email: string | null;
  teacherId: string | null;
  teacherName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// =====================================
// Teacher Management API
// =====================================

export async function fetchTeachers(): Promise<TeacherSummary[]> {
  const response = await fetch(`${API_BASE}/superuser/teachers`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<TeacherSummary[]>(response);
}

export async function createTeacher(
  email: string,
  name: string,
  password: string,
  forcePasswordChange: boolean = true
): Promise<TeacherSummary> {
  const response = await fetch(`${API_BASE}/superuser/teachers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, name, password, forcePasswordChange }),
  });
  return handleResponse<TeacherSummary>(response);
}

export async function deleteTeacher(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/superuser/teachers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function updateTeacher(
  id: string,
  data: { name?: string; email?: string }
): Promise<TeacherSummary> {
  const response = await fetch(`${API_BASE}/superuser/teachers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<TeacherSummary>(response);
}

// =====================================
// Global Student API
// =====================================

export async function fetchAllStudents(): Promise<StudentWithTeacher[]> {
  const response = await fetch(`${API_BASE}/superuser/students`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<StudentWithTeacher[]>(response);
}

export async function reassignStudent(
  studentId: string,
  teacherId: string | null
): Promise<{ id: string; studentId: string | null; name: string; teacherId: string | null }> {
  const response = await fetch(`${API_BASE}/superuser/students/${studentId}/reassign`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ teacherId }),
  });
  return handleResponse(response);
}

// =====================================
// Password Management API
// =====================================

export async function setTeacherPassword(
  teacherId: string,
  password: string,
  forcePasswordChange: boolean = true
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/superuser/teachers/${teacherId}/set-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password, forcePasswordChange }),
  });
  return handleResponse(response);
}

export async function setStudentPassword(
  studentId: string,
  password: string,
  forcePasswordChange: boolean = true
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/superuser/students/${studentId}/set-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password, forcePasswordChange }),
  });
  return handleResponse(response);
}

// =====================================
// Practice Sheet Management API
// =====================================

export interface PracticeSheetWithCreator {
  id: string;
  name: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string | null;
  } | null;
}

export interface PracticeSheetDetail {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  questions: Array<{
    questionNumber: number;
    expression: string;
    answer: number;
  }>;
}

export interface Question {
  expression: string;
  answer: number;
}

export async function fetchAllPracticeSheets(): Promise<PracticeSheetWithCreator[]> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PracticeSheetWithCreator[]>(response);
}

export async function fetchPracticeSheet(id: string): Promise<PracticeSheetDetail> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<PracticeSheetDetail>(response);
}

export async function updatePracticeSheet(
  id: string,
  name: string
): Promise<{ id: string; name: string; updatedAt: string }> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deletePracticeSheet(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function replacePracticeSheetQuestions(
  id: string,
  questions: Question[]
): Promise<{ success: boolean; questionCount: number }> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets/${id}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ questions }),
  });
  return handleResponse(response);
}

export async function updatePracticeSheetQuestion(
  sheetId: string,
  questionNumber: number,
  expression: string,
  answer: number
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE}/superuser/practice-sheets/${sheetId}/questions/${questionNumber}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ expression, answer }),
    }
  );
  return handleResponse(response);
}

export async function deletePracticeSheetQuestion(
  sheetId: string,
  questionNumber: number
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE}/superuser/practice-sheets/${sheetId}/questions/${questionNumber}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function createPracticeSheet(data: {
  id?: string;
  name: string;
  questions?: Question[];
}): Promise<PracticeSheetDetail> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PracticeSheetDetail>(response);
}

export async function addQuestions(
  sheetId: string,
  data: {
    questions?: Question[];
    bulkText?: string;
    replace?: boolean;
  }
): Promise<{ success: boolean; questionsAdded: number }> {
  const response = await fetch(`${API_BASE}/superuser/practice-sheets/${sheetId}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
