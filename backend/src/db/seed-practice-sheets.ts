import { query, withTransaction, closePool } from '../db';
import { PRACTICE_SHEETS } from '../data/practiceSheets';

async function seedPracticeSheets() {
  console.log('Starting practice sheets seed...');

  try {
    await withTransaction(async (client) => {
      // Check if tables exist
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'practice_sheets'
        )
      `);

      if (!tableCheck.rows[0].exists) {
        console.log('Creating practice_sheets table...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS practice_sheets (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS practice_sheet_questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            practice_sheet_id VARCHAR(50) NOT NULL REFERENCES practice_sheets(id) ON DELETE CASCADE,
            question_number INTEGER NOT NULL,
            expression VARCHAR(255) NOT NULL,
            answer INTEGER NOT NULL,
            UNIQUE(practice_sheet_id, question_number)
          )
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_practice_sheet_questions_sheet_id
          ON practice_sheet_questions(practice_sheet_id)
        `);
      }

      // Check if data already exists
      const existingCount = await client.query('SELECT COUNT(*) as count FROM practice_sheets');
      if (parseInt(existingCount.rows[0].count) > 0) {
        console.log('Practice sheets already seeded. Skipping...');
        return;
      }

      console.log(`Seeding ${PRACTICE_SHEETS.length} practice sheets...`);

      for (const sheet of PRACTICE_SHEETS) {
        console.log(`  - ${sheet.name} (${sheet.questions.length} questions)`);

        // Insert practice sheet
        await client.query(
          `INSERT INTO practice_sheets (id, name)
           VALUES ($1, $2)
           ON CONFLICT (id) DO NOTHING`,
          [sheet.id, sheet.name]
        );

        // Insert questions
        for (let i = 0; i < sheet.questions.length; i++) {
          const q = sheet.questions[i];
          await client.query(
            `INSERT INTO practice_sheet_questions (practice_sheet_id, question_number, expression, answer)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (practice_sheet_id, question_number) DO NOTHING`,
            [sheet.id, i + 1, q.expression, q.answer]
          );
        }
      }

      console.log('Seed completed successfully!');
    });
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  seedPracticeSheets()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedPracticeSheets };
