-- Practice sheets table
CREATE TABLE IF NOT EXISTS practice_sheets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    form_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS practice_sheet_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_sheet_id VARCHAR(50) NOT NULL REFERENCES practice_sheets(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    expression VARCHAR(255) NOT NULL,
    answer INTEGER NOT NULL,
    UNIQUE(practice_sheet_id, question_number)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_practice_sheet_questions_sheet_id
ON practice_sheet_questions(practice_sheet_id);
