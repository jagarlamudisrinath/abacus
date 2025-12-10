import { Request } from 'express';

export type UserRole = 'student' | 'teacher' | 'superuser';

export interface Student {
  id: string;
  email: string | null;
  studentId: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  grade: string | null;
  role: UserRole;
  teacherId: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  settings: Record<string, any>;
}

export interface LoginRequest {
  identifier: string; // email or student ID
  // Note: name field removed - student self-signup is disabled
  // Students can only be created by teachers or admins
}

export interface TeacherLoginRequest {
  email: string;
  password: string;
}

export interface TeacherRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  student: Student;
  isNewUser: boolean;
}

export interface AuthenticatedRequest extends Request {
  student?: Student;
}

export interface JWTPayload {
  studentId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
