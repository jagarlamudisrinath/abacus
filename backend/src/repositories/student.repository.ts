import { query } from '../db';
import { Student, UserRole } from '../types/auth.types';

interface StudentRow {
  id: string;
  email: string | null;
  student_id: string | null;
  name: string;
  first_name: string | null;
  last_name: string | null;
  grade: string | null;
  role: UserRole;
  teacher_id: string | null;
  password_hash: string | null;
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
    firstName: row.first_name,
    lastName: row.last_name,
    grade: row.grade,
    role: row.role || 'student',
    teacherId: row.teacher_id,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    settings: row.settings || {},
  };
}

// Generate sequential student ID (S001, S002, etc.)
async function generateStudentId(): Promise<string> {
  const result = await query<{ nextval: string }>(
    "SELECT nextval('student_id_seq')"
  );
  const num = parseInt(result.rows[0].nextval, 10);
  return `S${num.toString().padStart(3, '0')}`;
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

export async function updateStudent(
  id: string,
  updates: { firstName?: string; lastName?: string; grade?: string; email?: string }
): Promise<Student | null> {
  const setClauses: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (updates.firstName !== undefined || updates.lastName !== undefined) {
    // If either name part is updated, recalculate full name
    const existingResult = await query<StudentRow>(
      'SELECT first_name, last_name FROM students WHERE id = $1',
      [id]
    );
    if (!existingResult.rows[0]) return null;

    const firstName = updates.firstName ?? existingResult.rows[0].first_name ?? '';
    const lastName = updates.lastName ?? existingResult.rows[0].last_name ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (updates.firstName !== undefined) {
      setClauses.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setClauses.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }
    setClauses.push(`name = $${paramIndex++}`);
    values.push(fullName);
  }

  if (updates.grade !== undefined) {
    setClauses.push(`grade = $${paramIndex++}`);
    values.push(updates.grade || null);
  }

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email ? updates.email.toLowerCase() : null);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const result = await query<StudentRow>(
    `UPDATE students
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

// Teacher-specific functions

export async function createTeacher(email: string, name: string, passwordHash: string): Promise<Student> {
  const result = await query<StudentRow>(
    `INSERT INTO students (email, name, role, password_hash)
     VALUES ($1, $2, 'teacher', $3)
     RETURNING *`,
    [email.toLowerCase(), name, passwordHash]
  );
  return mapRowToStudent(result.rows[0]);
}

export async function findTeacherByEmail(email: string): Promise<{ student: Student; passwordHash: string } | null> {
  const result = await query<StudentRow>(
    `SELECT * FROM students WHERE email = $1 AND role = 'teacher'`,
    [email.toLowerCase()]
  );
  if (!result.rows[0]) return null;
  return {
    student: mapRowToStudent(result.rows[0]),
    passwordHash: result.rows[0].password_hash || '',
  };
}

export async function findStudentsByTeacherId(teacherId: string): Promise<Student[]> {
  const result = await query<StudentRow>(
    `SELECT * FROM students WHERE teacher_id = $1 ORDER BY name`,
    [teacherId]
  );
  return result.rows.map(mapRowToStudent);
}

export async function createStudentForTeacher(
  firstName: string,
  lastName: string,
  teacherId: string,
  grade?: string,
  email?: string
): Promise<Student> {
  const studentId = await generateStudentId();
  const fullName = `${firstName} ${lastName}`.trim();

  const result = await query<StudentRow>(
    `INSERT INTO students (student_id, name, first_name, last_name, grade, teacher_id, role, email)
     VALUES ($1, $2, $3, $4, $5, $6, 'student', $7)
     RETURNING *`,
    [studentId, fullName, firstName, lastName, grade || null, teacherId, email?.toLowerCase() || null]
  );
  return mapRowToStudent(result.rows[0]);
}

export async function updateStudentTeacher(studentId: string, teacherId: string | null): Promise<Student | null> {
  const result = await query<StudentRow>(
    `UPDATE students
     SET teacher_id = $2
     WHERE id = $1 AND role = 'student'
     RETURNING *`,
    [studentId, teacherId]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM students WHERE id = $1 AND role = 'student'`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

// Superuser-specific functions

export async function findAdminByEmail(email: string): Promise<{ student: Student; passwordHash: string } | null> {
  // Find teacher or superuser by email for login
  const result = await query<StudentRow>(
    `SELECT * FROM students WHERE email = $1 AND role IN ('teacher', 'superuser')`,
    [email.toLowerCase()]
  );
  if (!result.rows[0]) return null;
  return {
    student: mapRowToStudent(result.rows[0]),
    passwordHash: result.rows[0].password_hash || '',
  };
}

export async function findAllTeachers(): Promise<Array<Student & { studentCount: number }>> {
  const result = await query<StudentRow & { student_count: string }>(
    `SELECT t.*, COUNT(s.id)::text as student_count
     FROM students t
     LEFT JOIN students s ON s.teacher_id = t.id AND s.role = 'student'
     WHERE t.role = 'teacher'
     GROUP BY t.id
     ORDER BY t.name`,
    []
  );
  return result.rows.map(row => ({
    ...mapRowToStudent(row),
    studentCount: parseInt(row.student_count, 10),
  }));
}

export async function findAllStudentsGlobal(): Promise<Array<Student & { teacherName: string | null }>> {
  const result = await query<StudentRow & { teacher_name: string | null }>(
    `SELECT s.*, t.name as teacher_name
     FROM students s
     LEFT JOIN students t ON s.teacher_id = t.id
     WHERE s.role = 'student'
     ORDER BY s.name`,
    []
  );
  return result.rows.map(row => ({
    ...mapRowToStudent(row),
    teacherName: row.teacher_name,
  }));
}

export async function deleteTeacher(id: string): Promise<boolean> {
  // First unassign all students from this teacher
  await query(
    `UPDATE students SET teacher_id = NULL WHERE teacher_id = $1`,
    [id]
  );
  // Then delete the teacher
  const result = await query(
    `DELETE FROM students WHERE id = $1 AND role = 'teacher'`,
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

export async function updateTeacherInfo(
  id: string,
  updates: { name?: string; email?: string }
): Promise<Student | null> {
  const setClauses: string[] = [];
  const values: (string | null)[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email ? updates.email.toLowerCase() : null);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const result = await query<StudentRow>(
    `UPDATE students
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex} AND role = 'teacher'
     RETURNING *`,
    values
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function createSuperuser(email: string, name: string, passwordHash: string): Promise<Student> {
  const result = await query<StudentRow>(
    `INSERT INTO students (email, name, role, password_hash)
     VALUES ($1, $2, 'superuser', $3)
     RETURNING *`,
    [email.toLowerCase(), name, passwordHash]
  );
  return mapRowToStudent(result.rows[0]);
}

export async function findSuperuserByEmail(email: string): Promise<Student | null> {
  const result = await query<StudentRow>(
    `SELECT * FROM students WHERE email = $1 AND role = 'superuser'`,
    [email.toLowerCase()]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}

export async function reassignStudent(studentId: string, newTeacherId: string | null): Promise<Student | null> {
  const result = await query<StudentRow>(
    `UPDATE students
     SET teacher_id = $2
     WHERE id = $1 AND role = 'student'
     RETURNING *`,
    [studentId, newTeacherId]
  );
  return result.rows[0] ? mapRowToStudent(result.rows[0]) : null;
}
