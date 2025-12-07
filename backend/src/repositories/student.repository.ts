import { query } from '../db';
import { Student } from '../types/auth.types';

interface StudentRow {
  id: string;
  email: string | null;
  student_id: string | null;
  name: string;
  created_at: Date;
  last_login_at: Date | null;
  settings: Record<string, any>;
}

function mapRowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    email: row.email,
    studentId: row.student_id,
    name: row.name,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    settings: row.settings || {},
  };
}

export async function findByEmail(email: string): Promise<Student | null> {
  const result = await query<StudentRow>(
    'SELECT * FROM students WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function findByStudentId(studentId: string): Promise<Student | null> {
  const result = await query<StudentRow>(
    'SELECT * FROM students WHERE student_id = $1',
    [studentId]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function findById(id: string): Promise<Student | null> {
  const result = await query<StudentRow>(
    'SELECT * FROM students WHERE id = $1',
    [id]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function findByIdentifier(identifier: string): Promise<Student | null> {
  const isEmail = identifier.includes('@');
  return isEmail ? findByEmail(identifier) : findByStudentId(identifier);
}

export async function createWithEmail(email: string, name: string): Promise<Student> {
  const result = await query<StudentRow>(
    `INSERT INTO students (email, name)
     VALUES ($1, $2)
     RETURNING *`,
    [email.toLowerCase(), name]
  );
  return mapRowToStudent(result.rows[0]);
}

export async function createWithStudentId(studentId: string, name: string): Promise<Student> {
  const result = await query<StudentRow>(
    `INSERT INTO students (student_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [studentId, name]
  );
  return mapRowToStudent(result.rows[0]);
}

export async function create(identifier: string, name: string): Promise<Student> {
  const isEmail = identifier.includes('@');
  return isEmail
    ? createWithEmail(identifier, name)
    : createWithStudentId(identifier, name);
}

export async function updateLastLogin(id: string): Promise<void> {
  await query(
    'UPDATE students SET last_login_at = NOW() WHERE id = $1',
    [id]
  );
}

export async function updateSettings(id: string, settings: Record<string, any>): Promise<Student | null> {
  const result = await query<StudentRow>(
    `UPDATE students
     SET settings = $2
     WHERE id = $1
     RETURNING *`,
    [id, JSON.stringify(settings)]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function updateName(id: string, name: string): Promise<Student | null> {
  const result = await query<StudentRow>(
    `UPDATE students
     SET name = $2
     WHERE id = $1
     RETURNING *`,
    [id, name]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}
