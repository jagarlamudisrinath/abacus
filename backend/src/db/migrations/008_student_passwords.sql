-- Migration: Enable passwords for students (unified login)
-- Previously only teachers required passwords, now all users can have passwords

-- Remove the teacher-only password constraint
ALTER TABLE students DROP CONSTRAINT IF EXISTS teacher_requires_password;

-- Note: Existing students will have NULL password_hash
-- Teachers must set passwords for their students before they can log in
-- The application will check for NULL password and prompt accordingly
