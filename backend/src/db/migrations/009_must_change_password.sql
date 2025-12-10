-- Add must_change_password column to students table
-- This flag is set to TRUE when admin resets a password, requiring user to change it on next login

ALTER TABLE students ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Update existing records to have FALSE (no forced password change)
UPDATE students SET must_change_password = FALSE WHERE must_change_password IS NULL;
