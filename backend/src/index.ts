import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import testRoutes from './routes/test.routes';
import authRoutes from './routes/auth.routes';
import progressRoutes from './routes/progress.routes';
import adminRoutes from './routes/admin.routes';
import superuserRoutes from './routes/superuser.routes';
import { checkConnection, closePool } from './db';
import { seedSuperuser } from './db/seed-superuser';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superuser', superuserRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await checkConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await closePool();
  process.exit(0);
});

// Start server
async function startServer() {
  // Seed superuser from environment variables
  await seedSuperuser();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
