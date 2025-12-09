# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alama Abacus is a full-stack web application for abacus practice and assessment. It supports three user roles: students (take tests), teachers (manage students and practice sheets), and superusers (manage teachers). The application tracks detailed analytics including 7-minute interval performance, weak areas, and progression trends.

## Development Commands

### Backend (Express.js + TypeScript + Bun)
```bash
cd backend
bun install             # Install dependencies (first time or after package.json changes)
bun run dev             # Development server with hot reload (Bun's built-in watch mode)
bun run build           # Compile TypeScript to dist/
bun run start           # Run production build from dist/
bun run start:prod      # Run production build with NODE_ENV=production
bun test                # Run tests (when implemented)
```

**Note:** Bun is used as the runtime instead of Node.js for faster performance and built-in TypeScript support.

### Frontend (React + TypeScript)
```bash
cd frontend
npm start               # Development server on http://localhost:3000 (proxies to backend)
npm run build          # Production build to build/
npm test               # Run tests with Jest
```

### E2E Tests & Data Seeding (Playwright)
```bash
cd e2e
npm test                # Run all Playwright tests
npm run test:ui         # Run with Playwright UI
npm run test:headed     # Run with visible browser
npm run test:debug      # Run with debugger
npm run seed            # Generate test data (uses config/test-config.yaml)
npm run seed:quick      # Generate single session per user
npm run lint            # ESLint
npm run typecheck       # TypeScript check
```

### Docker Deployment
```bash
# Full stack with PostgreSQL
docker-compose up -d

# Individual services
docker-compose up -d postgres    # Database only
docker-compose up -d backend     # API only
docker-compose up -d frontend    # Client only

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Rebuild after code changes
docker-compose up -d --build
```

**Service Ports:**
- Frontend: http://localhost:8080 (Docker) or http://localhost:3000 (dev)
- Backend API: http://localhost:4001 (Docker) or http://localhost:3001 (dev)
- PostgreSQL: localhost:5432 (configurable via `POSTGRES_HOST_PORT` env var)

### Database Operations

**Database Options:**
- **Local Development:** PostgreSQL via Docker Compose
- **Production/Staging:** Supabase (managed PostgreSQL with built-in features)

**Migrations:**
- Location: `backend/src/db/migrations/`
- Auto-run on PostgreSQL container startup (local Docker)
- For Supabase: Run migrations manually via SQL Editor or migration tools
- Naming: `NNN_description.sql` (e.g., `001_create_students_table.sql`)
- Shell scripts (like `099_init_users.sh`) run last for seeding

**Manual Database Access:**
```bash
# Local Docker
docker-compose exec postgres psql -U alama -d alama_abacus

# Local direct connection
psql postgresql://alama:alama123@localhost:5432/alama_abacus

# Supabase (via connection string from dashboard)
psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**Supabase Setup:**
1. Create project at https://supabase.com
2. Get connection string from: Project Settings > Database > Connection String
3. Use **Transaction pooler** (port 6543) for app queries - set as `DATABASE_URL`
4. Use **Direct connection** (port 5432) only for migrations
5. Database is optimized for Supabase with:
   - Lower connection pool (max: 10) since Supabase handles pooling
   - SSL enabled automatically
   - Keep-warm connections (min: 2)

**Database Schema:**
- `students`: All users (students, teachers, superusers) with role-based access
- `sessions`: Test/practice session metadata with results and timing
- `session_responses`: Individual question responses with timestamps
- `practice_sheets`: Question banks with metadata
- `practice_sheet_questions`: Questions with expression and answer

## Architecture

### Monorepo Structure
```
/abacus
├── backend/          # Express.js API
├── frontend/         # React SPA
├── e2e/             # Playwright tests & data seeder
└── docker-compose.yml
```

### Backend Architecture

**Layered Pattern:**
- **Routes** (`src/routes/`): HTTP endpoint definitions with middleware
- **Services** (`src/services/`): Business logic (test generation, analytics, auth)
- **Repositories** (`src/repositories/`): Database queries (students, sessions, practice sheets)
- **Middleware** (`src/middleware/`): Authentication and authorization checks
- **Types** (`src/types/`): TypeScript interfaces

**Authentication Flow:**
1. `requireAuth` middleware: Verifies JWT, attaches `req.student`
2. `requireTeacher` middleware: Ensures role is 'teacher' or 'superuser'
3. `requireSuperuser` middleware: Ensures role is 'superuser'
4. `optionalAuth` middleware: Attaches user if authenticated, continues otherwise

**Key Services:**
- `auth.service.ts`: JWT tokens, password hashing (bcrypt), login/register
- `test.service.ts`: Test generation, in-memory + DB storage, submission
- `questionGenerator.service.ts`: Random question generation by difficulty
- `progress.service.ts`: Dashboard analytics, trends, weak areas, interval analysis

**Database Connection:**
- Connection pool in `src/db/index.ts` (max 20 connections)
- `withTransaction()` helper for atomic multi-step operations
- All repositories use parameterized queries (prevents SQL injection)

### Frontend Architecture

**State Management:**
- **AuthContext**: User authentication state (token in localStorage)
- **TestContext**: Test state with useReducer pattern (responses, navigation, timing)
- **SettingsContext**: User preferences (fontSize, theme)

**Screen Flow:**
```
LoginScreen → WelcomeScreen → TestInterface → ResultsScreen → ReviewScreen
                            ↓
                       Dashboard (analytics)
                            ↓
                  AdminDashboard / SuperuserDashboard
```

**Component Organization:**
- `components/auth/`: Login screens
- `components/test/`: Test interface, question display, timer, navigation
- `components/dashboard/`: Student analytics (charts, stats, session history)
- `components/admin/`: Teacher/superuser management interfaces
- `components/results/`: Post-test summary
- `components/review/`: Review wrong/unanswered questions

**API Communication:**
- Services in `src/services/` (api.ts, admin.api.ts, progress.api.ts)
- Base URL configurable via `REACT_APP_API_URL` (defaults to `/api` for proxy)
- Token passed in `Authorization: Bearer <token>` header

### Practice Sheet System

**Storage:** Questions stored in database (not generated on-the-fly)

**Data Sources:**
- Manual entry via admin UI
- Bulk import (CSV/TSV or plain text)
- Google Forms scraping (via `googleFormsScraper.ts`)

**Structure:**
- Practice sheet metadata: id, name, formUrl
- Questions: questionNumber, expression, answer
- Questions are immutable after session creation (sessions reference practice_sheet_id)

### Session Management

**Lifecycle:**
1. Generate test from practice sheet → Creates session in DB (if authenticated)
2. Auto-save progress every 5 seconds to localStorage (frontend)
3. Manual save via API (for persistence)
4. Submit → Calculates results, stores session + all responses atomically
5. 7-minute intervals tracked with snapshot data (questions attempted, correct/incorrect)

**Dual Storage:**
- In-memory (testService) for unauthenticated users
- PostgreSQL for authenticated users with full history

### Role-Based Access Control

**Students:**
- Take tests/practice sessions
- View personal dashboard and analytics
- No access to other students' data

**Teachers:**
- All student permissions
- Create/edit/delete students under their account
- Manage practice sheets (CRUD operations)
- View analytics for their students only
- Cannot access other teachers' students

**Superusers:**
- All teacher permissions
- Manage all teachers (CRUD)
- Reassign students between teachers
- Global access to all data
- Created via environment variables on startup

### API Routes

**Public:** `/api/health`

**Auth:** `/api/auth/` (login, register, me)

**Test:** `/api/test/` (generate, submit, save progress)
- Supports both authenticated and unauthenticated users
- Authenticated sessions persist to database

**Progress:** `/api/progress/` (dashboard, stats, sessions, trends, analytics)
- All require authentication
- Students see own data, teachers see their students, superusers see all

**Admin:** `/api/admin/` (practice sheets, student management)
- Requires teacher or superuser role
- Teachers scoped to their students

**Superuser:** `/api/superuser/` (teacher management, global student operations)
- Requires superuser role only

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
# Database
# Local development (Docker):
DATABASE_URL=postgresql://alama:alama123@postgres:5432/alama_abacus

# Local development (no Docker):
DATABASE_URL=postgresql://alama:alama123@localhost:5432/alama_abacus

# Supabase (Production/Staging):
# Use Transaction pooler for app queries (recommended)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
# Get from: Supabase Dashboard > Project Settings > Database > Connection String > Transaction

# Security
JWT_SECRET=your-jwt-secret-change-in-production

# Server
NODE_ENV=development
PORT=3001

# Superuser (created on startup if not exists)
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASSWORD=change-this-password
SUPERUSER_NAME=Super Admin

# Frontend (optional, defaults to '/api')
REACT_APP_API_URL=/api

# Database port mapping (Docker only, optional)
POSTGRES_HOST_PORT=5432
```

## E2E Testing & Data Seeding

**Configuration:** `e2e/config/test-config.yaml` (copy from test-config.example.yaml)

**Data Seeder:**
- Automates test session generation for configured users
- Simulates realistic user behavior with configurable accuracy
- Can be scheduled via cron or GitHub Actions
- Script: `e2e/scripts/run-daily.sh`

**GitHub Actions:**
- Workflow: `.github/workflows/scheduled-data-generation.yml`
- Runs daily at 2 PM UTC
- Configurable via workflow_dispatch inputs

## Key Technical Details

**Question Generation:**
- Three difficulty levels: C1, C2, C3 (config in `backend/src/config/difficultyLevels.ts`)
- Question types: Addition/Subtraction, Multiplication, Division/Mixed
- Randomized operands within difficulty-specific ranges

**7-Minute Intervals:**
- Tests track performance at 7-minute checkpoints
- Records: questions attempted, correct, incorrect at each interval
- Used for pacing analysis and identifying fatigue patterns

**Security:**
- JWT tokens with 30-day expiration
- bcrypt password hashing (10 rounds)
- Parameterized SQL queries
- Role-based middleware chain
- CORS enabled

**Performance:**
- Bun runtime (3-4x faster than Node.js)
- PostgreSQL connection pooling (optimized for Supabase)
- In-memory test storage for unauthenticated users
- Frontend localStorage for auto-save
- Debounced auto-save (5-second intervals)

## Development Workflow

1. **Local Development:**
   ```bash
   # Terminal 1: Start PostgreSQL (skip if using Supabase)
   docker-compose up -d postgres

   # Terminal 2: Start backend
   cd backend
   bun install  # First time only
   bun run dev

   # Terminal 3: Start frontend
   cd frontend
   npm install  # First time only
   npm start
   ```

2. **Docker Development:**
   ```bash
   docker-compose up -d
   # Backend changes require rebuild: docker-compose up -d --build backend
   # Frontend has hot reload via volume mount
   ```

3. **Database Migrations:**
   - Create new file in `backend/src/db/migrations/`
   - Use sequential numbering (e.g., `007_new_feature.sql`)
   - Restart PostgreSQL container or run manually

4. **Testing:**
   - Frontend: `cd frontend && npm test`
   - E2E: `cd e2e && npm test`
   - Manual testing: Use admin panel to create test users

## Common Patterns

**Adding a New API Endpoint:**
1. Create route in appropriate file (e.g., `backend/src/routes/admin.routes.ts`)
2. Add business logic in service (e.g., `backend/src/services/`)
3. Add database queries in repository (e.g., `backend/src/repositories/`)
4. Apply appropriate middleware (`requireAuth`, `requireTeacher`, etc.)
5. Create frontend API function in `frontend/src/services/`
6. Update TypeScript types as needed

**Adding a New Database Table:**
1. Create migration SQL file: `backend/src/db/migrations/NNN_description.sql`
2. Define table schema with proper foreign keys and indexes
3. Add repository class in `backend/src/repositories/`
4. Update TypeScript types in `backend/src/types/`
5. Restart PostgreSQL container to run migration

**Adding Role-Based Features:**
- Use existing middleware: `requireAuth`, `requireTeacher`, `requireSuperuser`
- For conditional behavior: Check `req.student.role` in service logic
- Frontend: Use `isTeacher`, `isSuperuser` from AuthContext

## Important Constraints

- Students cannot self-register (only teachers/admins create them)
- Practice sheet questions are immutable after session creation
- Teachers can only access their own students
- Session deletion is soft (preserves data integrity)
- All timestamps in UTC
- Division questions have no remainders (guaranteed)
