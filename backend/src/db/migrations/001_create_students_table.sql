-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    student_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::JSONB,

    -- At least one identifier required
    CONSTRAINT email_or_student_id CHECK (email IS NOT NULL OR student_id IS NOT NULL)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id) WHERE student_id IS NOT NULL;
