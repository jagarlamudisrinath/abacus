-- Create session_responses table (per-question responses)
CREATE TABLE IF NOT EXISTS session_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    expression VARCHAR(255) NOT NULL,
    correct_answer INTEGER NOT NULL,
    user_answer VARCHAR(50),
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER, -- seconds spent on this question (optional)

    UNIQUE(session_id, question_number)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_session_responses_session ON session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_session_responses_incorrect ON session_responses(session_id, is_correct) WHERE is_correct = false;
