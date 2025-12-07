import { Request } from 'express';

export interface Student {
  id: string;
  email: string | null;
  studentId: string | null;
  name: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  settings: Record<string, any>;
}

export interface LoginRequest {
  identifier: string; // email or student ID
  name?: string;      // required for new users
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
  iat?: number;
  exp?: number;
}
