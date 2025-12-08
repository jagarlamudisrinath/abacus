import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as studentRepo from '../repositories/student.repository';
import { Student, LoginRequest, LoginResponse, JWTPayload, UserRole, TeacherLoginRequest, TeacherRegisterRequest } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';
const SALT_ROUNDS = 10;

export async function loginOrRegister(request: LoginRequest): Promise<LoginResponse> {
  const { identifier } = request;

  // Try to find existing student
  const student = await studentRepo.findByIdentifier(identifier);

  if (!student) {
    // Student self-signup is disabled - students can only be created by teachers or admins
    throw new Error('Account not found. Please contact your teacher or administrator to create an account.');
  }

  // Update last login timestamp
  await studentRepo.updateLastLogin(student.id);

  // Generate JWT token with role
  const token = generateToken(student.id, student.role);

  return {
    token,
    student,
    isNewUser: false,
  };
}

export async function registerTeacher(request: TeacherRegisterRequest): Promise<LoginResponse> {
  const { email, password, name } = request;

  // Check if email already exists
  const existing = await studentRepo.findByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create teacher
  const teacher = await studentRepo.createTeacher(email, name, passwordHash);

  // Generate JWT token
  const token = generateToken(teacher.id, 'teacher');

  return {
    token,
    student: teacher,
    isNewUser: true,
  };
}

export async function loginTeacher(request: TeacherLoginRequest): Promise<LoginResponse> {
  const { email, password } = request;

  // Find teacher or superuser by email
  const result = await studentRepo.findAdminByEmail(email);
  if (!result) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, result.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login timestamp
  await studentRepo.updateLastLogin(result.student.id);

  // Generate JWT token with actual role from database
  const token = generateToken(result.student.id, result.student.role);

  return {
    token,
    student: result.student,
    isNewUser: false,
  };
}

export function generateToken(studentId: string, role: UserRole = 'student'): string {
  const payload: JWTPayload = { studentId, role };
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
