# HackForge — Frontend Platform Documentation

This directory contains the unified frontend web application for the **HackForge Hackathon Management, Submission, and Scoring Platform**.

---

## 1. Architecture & Technology Stack

- **Framework**: React 19 + TypeScript (ES2022)
- **Bundler / Dev Server**: Vite 8
- **Routing**: React Router 7 with role-based `ProtectedRoute` guards
- **Icons**: Lucide React
- **Design System**: Vanilla CSS design tokens with dark-mode technical SaaS aesthetic, glassmorphism cards, responsive grids, and micro-animations.
- **State & Context**:
  - `AuthContext`: Stateful session resolution (`/api/auth/me`), login/register/logout actions, role helpers, and 1-click Quick Demo Persona switcher.
  - `ToastContext`: Accessible animated toast notifications (success, error, warning, info).
  - `ModeContext`: Real-time backend health check monitoring (`/api/health`) and seamless toggle between Live API Mode and Demo Mock Mode.
- **Testing**: Vitest + jsdom + Testing Library

---

## 2. Directory Structure

```
frontend/
├── src/
│   ├── types/
│   │   └── index.ts                 # Type definitions (User, Event, Team, Submission, Rubric, Evaluation, etc.)
│   ├── services/
│   │   ├── apiClient.ts             # Centralized fetch client with credential/bearer handling & error parsing
│   │   ├── authService.ts           # Login, registration, session me, logout
│   │   ├── eventService.ts          # Event creation, updates, and access inspection
│   │   ├── trackService.ts          # Challenge tracks management
│   │   ├── prizeService.ts          # Prize categories and bounties
│   │   ├── teamService.ts           # Team creation, invite code generation, invite acceptance
│   │   ├── submissionService.ts     # Project creation, draft saving, finalization lock
│   │   ├── judgingService.ts        # Rubrics, judge invitations, assignments, evaluations, Z-score normalization
│   │   ├── votingService.ts         # Community choice voting and anti-duplicate vote checks
│   │   ├── userService.ts           # User directory and RBAC role assignment
│   │   └── mockData.ts              # Deterministic mock fixtures for offline / fallback demo
│   ├── context/
│   │   ├── AuthContext.tsx          # User session, login, logout, role helpers
│   │   ├── ToastContext.tsx         # Toast notifications system
│   │   └── ModeContext.tsx          # Live API vs Demo Mock Mode toggle
│   ├── components/
│   │   └── common/
│   │       ├── Navbar.tsx           # Sticky navigation with role switchers and backend health pill
│   │       ├── Sidebar.tsx          # Role-specific navigation sidebar
│   │       ├── StatusBadge.tsx      # Color-coded status badge
│   │       ├── DeadlineCountdown.tsx# Live countdown with urgent and expired states
│   │       ├── StatCard.tsx         # Metric summary card
│   │       ├── LoadingSpinner.tsx   # Loading spinner and skeleton state
│   │       ├── EmptyState.tsx       # Illustrated empty state
│   │       ├── ErrorState.tsx       # Error banner with retry trigger
│   │       ├── Modal.tsx            # Accessible modal dialog with focus trap
│   │       └── ProtectedRoute.tsx   # Role-based route guard
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx            # Login with 1-click Quick Persona buttons
│   │   │   └── Register.tsx         # Registration form
│   │   ├── participant/
│   │   │   ├── Dashboard.tsx        # Participant hub: countdown, readiness checklist, tracks
│   │   │   ├── MyTeam.tsx           # Squad management, invite code copy, email invitations
│   │   │   ├── MyProject.tsx        # Project overview, readiness, submission lock
│   │   │   ├── ProjectEdit.tsx      # Create/Edit project with deliverable URL validation
│   │   │   ├── ProjectGallery.tsx   # Project showcase with search, track filtering, sorting
│   │   │   ├── ProjectDetails.tsx   # Project story, artifacts, discussion comments
│   │   │   ├── DiscoverTracks.tsx   # Challenge tracks and prize pool
│   │   │   └── MyActivity.tsx       # Activity timeline
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # High-level metrics and judging velocity
│   │   │   ├── EventManagement.tsx  # Dates, deadlines, tracks, prizes configuration
│   │   │   ├── UserManagement.tsx   # User directory & RBAC role elevations
│   │   │   ├── TeamManagement.tsx   # Team roster and invite code audit
│   │   │   ├── SubmissionReview.tsx # Submissions table with status filtering
│   │   │   ├── JudgeManagement.tsx  # Judge invitations, status, and revocation
│   │   │   ├── JudgeAssignments.tsx # Manual & batch assignment distribution
│   │   │   ├── RubricManagement.tsx # Rubrics & weighted criteria builder (100% balance check)
│   │   │   └── ResultsDashboard.tsx # Normalized scores, Z-scores, publish toggle, CSV export
│   │   ├── judge/
│   │   │   ├── JudgeDashboard.tsx   # Judge queue and completion rate
│   │   │   ├── JudgeProjects.tsx    # List of assigned submissions
│   │   │   └── JudgeEvaluate.tsx    # Rubric scoring sliders, weighted score calculator, feedback
│   │   ├── community/
│   │   │   └── CommunityVoting.tsx  # Community showcase with randomized ordering and voting
│   │   └── common/
│   │       ├── Unauthorized.tsx     # 403 Forbidden page
│   │       └── NotFound.tsx         # 404 Not Found page
│   ├── App.tsx                      # Master unified router
│   ├── main.tsx                     # React root mount
│   ├── index.css                    # Design tokens & typography
│   └── App.css                      # Component utility classes
├── package.json
└── vite.config.js
```

---

## 3. Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:5000` | Target backend REST API endpoint |

---

## 4. Available Portals & Routes

### Participant Portal
- `/` or `/dashboard` — Event countdown, readiness tracker, track discovery
- `/team` — Team creation, joining via invite code, roster, email invitations
- `/project` — Submission overview and lock status
- `/project/create` — Create project submission form
- `/project/edit` or `/project/edit/:id` — Edit project submission draft
- `/project/:id` — Project details, artifact links, comments feed
- `/gallery` — Public project gallery (search, filter, sort)
- `/tracks` — Discover challenge tracks and prizes
- `/activity` — Account activity timeline

### Organizer / Admin Portal
- `/admin` — Organizer metrics, judging completion velocity, recent submissions
- `/events` — Event dates, deadlines, tracks, and prizes configuration
- `/users` — User directory, role elevation (USER, ADMIN, SUPER_ADMIN), active toggle
- `/teams` — Registered teams roster and invite codes
- `/submissions` — Project review table with filter controls
- `/judges` — Judge invitations and revocation
- `/assignments` — Manual and automated batch judge assignment matrix
- `/rubrics` — Rubric criteria and weight configuration
- `/results` — Mathematical score calculation, public visibility toggle, CSV export

### Judge Portal
- `/judge` — Judge dashboard, assigned count, completed vs pending reviews
- `/judge/projects` — Assigned projects list
- `/judge/evaluate/:id` — Rubric criteria scoring sliders, live weighted calculator, feedback textarea

### Community Voting
- `/community` — Community choice voting showcase, randomized order, duplicate vote protection

---

## 5. Quick Demo Personas

When running the application, use the **Quick Persona Switcher** in the top navigation bar or log in with any seeded credentials:

- **Participant**: `alice@hackathon.local` / `Password123!`
- **Judge**: `judge1@hackathon.local` / `Password123!`
- **Organizer**: `organizer@hackathon.local` / `Password123!`
- **Super Admin**: `admin@hackathon.local` / `Password123!`

---

## 6. Development & Build Commands

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run test suites
npm test

# Build production bundle
npm run build
```
