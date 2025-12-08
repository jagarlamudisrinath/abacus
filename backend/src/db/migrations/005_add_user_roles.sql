-- Add user roles and teacher-student relationship
-- This migration adds role-based access control and teacher-student relationships

-- Add role column with default 'student'
ALTER TABLE students ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';

-- Add password_hash column for teacher authentication (nullable for students)
ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add teacher_id foreign key to establish student-teacher relationship
ALTER TABLE students ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES students(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_role ON students(role);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id) WHERE teacher_id IS NOT NULL;

-- Add constraint to ensure teachers cannot have a teacher_id
-- (teachers don't belong to other teachers)
ALTER TABLE students DROP CONSTRAINT IF EXISTS teacher_no_parent;
ALTER TABLE students ADD CONSTRAINT teacher_no_parent
  CHECK (role != 'teacher' OR teacher_id IS NULL);

-- Add constraint to ensure teachers have a password
ALTER TABLE students DROP CONSTRAINT IF EXISTS teacher_requires_password;
ALTER TABLE students ADD CONSTRAINT teacher_requires_password
  CHECK (role != 'teacher' OR password_hash IS NOT NULL);
