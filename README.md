# Hackathon Evaluation & Judging Platform

A full-stack hackathon management and judging platform featuring deterministic scoring rubrics, multi-judge evaluation aggregation, role-based access control, and verifiable audit logging.

---

## 1. Prerequisites

To run this platform locally via Docker Compose, ensure the following tools are installed on your host system:

- **Docker**: Docker Engine 24.0+ or Docker Desktop (with Docker Compose V2)
- **Node.js & npm** (optional, only needed for local development outside Docker): Node.js v20+ and npm v10+

---

## 2. Quick Start (Docker Compose)

Start the entire environment (PostgreSQL + Backend API with migrations & seed fixtures) with a single command:

```bash
docker compose up
```

To run in detached (background) mode:

```bash
docker compose up -d
```

### What Happens on Startup:
1. **PostgreSQL Service (`hackathon_postgres`)**:
   - Starts PostgreSQL 16 on internal port `5432` (mapped to host port `5432`).
   - Initializes healthcheck (`pg_isready`).
   - Stores all data in a persistent named Docker volume (`postgres_data`).
2. **Backend Service (`hackathon_backend`)**:
   - Waits for PostgreSQL to be healthy before starting (`depends_on` healthcheck).
   - Executes `npx prisma migrate deploy` to safely apply the initial database schema migration.
   - Executes `npx prisma db seed` to deterministically seed local demo fixtures (idempotent).
   - Launches the Express production server on port `5000`.

---

## 3. Stopping the Services

To stop running containers:

```bash
docker compose down
```

To stop containers and reset the local database volume (complete clean slate):

```bash
docker compose down -v
```

---

## 4. Local URLs & Endpoints

| Service / Endpoint | URL | Description |
| :--- | :--- | :--- |
| **Backend Health Check** | `http://localhost:5000/health` | Returns service health status, uptime, and environment |
| **API Health Check** | `http://localhost:5000/api/health` | Alternate API health route |
| **Authentication API** | `http://localhost:5000/api/auth` | User registration, login, logout, and session inspection |
| **Events API** | `http://localhost:5000/api/events` | Events, tracks, teams, submissions, rubrics, and judging |
| **PostgreSQL Database** | `localhost:5432` | Accessible via psql or GUI clients using credentials from `.env.example` |

---

## 5. Development & Demo Credentials

> [!CAUTION]
> **DEVELOPMENT / DEMO USE ONLY**
> The accounts and credentials below are strictly for local testing and demonstration purposes. Never use these credentials in staging, production, or any publicly accessible environment.

### Default Password
All seeded demo accounts share the local development password:
```
Password123!
```

### Seeded Accounts & Roles

| Email | Name | Global Role | Event Role | Context / Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| `admin@hackathon.local` | System Administrator | `SUPER_ADMIN` | — | Global platform administrator |
| `organizer@hackathon.local` | Elena Vance | `USER` | `ORGANIZER` | Hackathon organizer (manages tracks, rubrics, assignments) |
| `judge1@hackathon.local` | Dr. Marcus Brody | `USER` | `JUDGE` | Evaluator (completed eval for Team Alpha, assigned to Team Beta) |
| `judge2@hackathon.local` | Dr. Sarah Chen | `USER` | `JUDGE` | Evaluator (completed eval for Team Alpha, assigned to Team Beta) |
| `alice@hackathon.local` | Alice Johnson | `USER` | `PARTICIPANT` | Team Leader for **AgentOps Core** (Track: Autonomous Agents) |
| `bob@hackathon.local` | Bob Smith | `USER` | `PARTICIPANT` | Team Member for **AgentOps Core** |
| `carol@hackathon.local` | Carol Williams | `USER` | `PARTICIPANT` | Team Leader for **DevPulse Labs** (Track: Developer Infrastructure) |

### Pre-Seeded Fixture Dataset Overview
The idempotent seed script (`backend/prisma/seed.ts`) automatically populates:
- **Event**: "Autonomous AI & Developer Hackathon 2026" (Status: `ACTIVE`)
- **Tracks**:
  - `Autonomous Agents`
  - `Developer Infrastructure`
- **Teams & Submissions**:
  - `AgentOps Core`: "AgentFlow Orchestrator" (Status: `SUBMITTED`, Track: Autonomous Agents)
  - `DevPulse Labs`: "PulseTrace Telemetry" (Status: `SUBMITTED`, Track: Developer Infrastructure)
- **Rubric & Weighted Criteria**:
  - Technical Execution & Architecture: 4,000 basis points (40.00%)
  - Innovation & Originality: 3,000 basis points (30.00%)
  - Impact & Practical Utility: 3,000 basis points (30.00%)
  - *Total: exactly 10,000 basis points (100.00%)*
- **Judging Assignments & Evaluations**:
  - Judge 1 & Judge 2 evaluated Submission 1 (scores: 88.50 and 84.50 with criterion breakdowns).
  - Judge 1 & Judge 2 assigned to Submission 2 (ready for evaluation).
- **Judge Invitation**:
  - Pending invitation for `invited.judge@hackathon.local`.

---

## 6. Useful Docker Commands

```bash
# Check status of running containers
docker compose ps

# View real-time logs from backend service
docker compose logs -f backend

# View real-time logs from database service
docker compose logs -f postgres

# Check Prisma migration status inside backend container
docker compose exec backend npx prisma migrate status

# Re-run idempotent seed script inside backend container
docker compose exec backend npx prisma db seed

# Open a shell in the backend container
docker compose exec backend sh
```

---

## 7. Local Development (Outside Docker)

If you wish to run the backend directly on your host machine without Docker:

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Apply migrations to local PostgreSQL instance
npm run prisma:migrate

# Seed demo fixtures
npm run prisma:seed

# Compile TypeScript
npm run build

# Run automated test suite
npm test

# Start the compiled backend server
npm start
```