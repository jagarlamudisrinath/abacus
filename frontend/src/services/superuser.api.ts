const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
