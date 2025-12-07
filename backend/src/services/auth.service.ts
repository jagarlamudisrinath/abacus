import jwt from 'jsonwebtoken';
import * as studentRepo from '../repositories/student.repository';
import { Student, LoginRequest, LoginResponse, JWTPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';

export async function loginOrRegister(request: LoginRequest): Promise<LoginResponse> {
  const { identifier, name } = request;

  // Try to find existing student
  let student = await studentRepo.findByIdentifier(identifier);
  let isNewUser = false;

  if (!student) {
    // Create new student - name is required for new users
    if (!name || name.trim() === '') {
      throw new Error('Name is required for new users');
    }
    student = await studentRepo.create(identifier, name.trim());
    isNewUser = true;
  }

  // Update last login timestamp
  await studentRepo.updateLastLogin(student.id);

  // Generate JWT token
  const token = generateToken(student.id);

  return {
    token,
    student,
    isNewUser,
  };
}

export function generateToken(studentId: string): string {
  const payload: JWTPayload = { studentId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function getStudentFromToken(token: string): Promise<Student | null> {
  try {
    const payload = verifyToken(token);
    return await studentRepo.findById(payload.studentId);
  } catch (error) {
    return null;
  }
}

export async function getStudentById(id: string): Promise<Student | null> {
  return studentRepo.findById(id);
}
