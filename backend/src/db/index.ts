import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Supabase provides two connection strings:
// 1. DATABASE_URL - Pooled connection (Transaction mode) - Use this for app queries
// 2. DIRECT_DATABASE_URL - Direct connection - Use for migrations/admin tasks
//
// For Supabase, keep max connections low since Supabase Pooler handles connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://alama:alama123@localhost:5432/alama_abacus',
  max: 10, // Lower max for Supabase pooled connections (they handle pooling)
  min: 2,  // Keep some connections warm
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Longer timeout for Supabase
  // SSL required for Supabase (automatically handled by connection string)
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : undefined,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Helper function for queries
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Query error:', { text: text.substring(0, 100), error });
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Check database connection
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('PostgreSQL pool closed');
}

export default pool;
