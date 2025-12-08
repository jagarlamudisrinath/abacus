-- Migration: Add first_name, last_name, and grade columns for enhanced student creation
-- Also adds a sequence for auto-generating student IDs

-- Add new columns for first name, last name, and grade
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS grade VARCHAR(50);

-- Create sequence for auto-generating student_id (S001, S002, etc.)
CREATE SEQUENCE IF NOT EXISTS student_id_seq START WITH 1;

-- Migrate existing data: populate first_name and last_name from existing name field
UPDATE students
SET
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND name IS NOT NULL;
