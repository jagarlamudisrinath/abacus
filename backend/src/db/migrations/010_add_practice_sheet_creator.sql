-- Add created_by column to track who created each practice sheet
ALTER TABLE practice_sheets ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES students(id);

-- Create index for efficient lookups by creator
CREATE INDEX IF NOT EXISTS idx_practice_sheets_created_by ON practice_sheets(created_by);
