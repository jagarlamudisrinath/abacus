-- Create sessions table (practice sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    practice_sheet_id VARCHAR(50) NOT NULL,
    practice_sheet_name VARCHAR(255) NOT NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('practice', 'test')),
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),

    -- Results
    total_questions INTEGER NOT NULL,
    attempted INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    incorrect INTEGER DEFAULT 0,
    unanswered INTEGER DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- in seconds

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Section results as JSONB for flexibility
    section_results JSONB DEFAULT '[]'::JSONB,

    -- Interval stats for 7-minute breakdown
    intervals JSONB DEFAULT '[]'::JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_completed_at ON sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_sessions_practice_sheet ON sessions(practice_sheet_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_completed ON sessions(student_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
