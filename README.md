# Review Track — Backend API

REST API for a multi-role application review platform. Applicants submit requests; reviewers manage them through a defined workflow with a full audit trail.

---

## Table of Contents

- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Docker Instructions](#docker-instructions)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [HTTP Status Codes](#http-status-codes)
- [Middleware](#middleware)
- [Workflow Explanation](#workflow-explanation)
- [Email Notifications](#email-notifications)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Trade-offs](#trade-offs)
- [AI Usage](#ai-usage)
- [Future Improvements](#future-improvements)

---

## Architecture

```
React Frontend
      │
      │  HTTP / JSON
      ▼
Express REST API  ──────────►  Nodemailer (SMTP)
      │
  ┌───┴───────────┐
  │               │
  ▼               ▼
Prisma ORM     JWT Auth
  │            (jsonwebtoken)
  ▼
PostgreSQL
```

**Request lifecycle:**
1. `protect` middleware verifies the JWT and attaches the user to `req.user`
2. `requireRole` middleware enforces role-based access
3. Controller validates the requested state transition via `canTransition`
4. Service layer writes the status update and audit log in a single Prisma transaction
5. Email notification fires asynchronously after the transaction commits

---

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Environment variable loading (env.ts)
│   ├── controllers/     # Request handlers — applicant, reviewer, auth, health
│   ├── docs/            # OpenAPI spec (Scalar)
│   ├── lib/             # Prisma client singleton
│   ├── middleware/       # auth, role, validation, error handling
│   ├── models/          # Shared TypeScript interfaces and enums
│   ├── routes/          # Express router definitions
│   ├── services/        # Business logic — applications, reviews, workflow, notifications
│   ├── utils/           # Pure helpers — response formatting, email templates
│   └── validators/      # express-validator chains
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── tests/
    ├── unit/            # Pure function and service tests
    └── integration/     # HTTP-level endpoint tests
```

---

## Installation

**Prerequisites:** Node.js 22+, Docker

```bash
git clone https://github.com/Aliyon-dev/review-track-backend
cd review-track-backend
npm install
```

---

## Docker Instructions

### Local development (DB only)

Spins up a local Postgres container. The API runs locally with hot reload.

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Production (full stack)

Builds and runs the API container. Requires `DATABASE_URL`, `JWT_SECRET`, and `PORT` to be set.

```bash
docker compose up --build
```

The production image uses a multi-stage build — TypeScript is compiled in the build stage and only the compiled output and production dependencies are included in the final image.

---

## Local Setup

```bash
# 1. Start the local database
docker compose -f docker-compose.dev.yml up -d

# 2. Copy and configure environment variables
cp .env.example .env
# Set DATABASE_URL to the local Postgres instance (see below)

# 3. Apply migrations
npx prisma migrate deploy

# 4. Generate the Prisma client
npx prisma generate

# 5. Seed the database
npm run db:seed

# 6. Start the development server
npm run dev
```

The API will be available at `http://localhost:8000`.  
Interactive API docs (Scalar) are at `http://localhost:8000/api/docs`.

**Seed accounts** (all passwords: `password123`):

| Email | Role |
|-------|------|
| temboaliyon@gmail.com | APPLICANT |
| reviewer@example.com | REVIEWER |
| admin@example.com | ADMIN |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `changeme` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry (e.g. `1d`, `7d`) |
| `PORT` | No | `3000` | Port the server listens on |
| `API_URL` | No | `http://localhost:<PORT>` | Base URL shown in the API docs |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port (587 = STARTTLS, 465 = SSL) |
| `SMTP_USER` | No | — | SMTP login username. Email notifications are skipped when not set. |
| `SMTP_PASS` | No | — | SMTP password or app-specific password |
| `FROM_EMAIL` | No | `notifications@yourdomain.com` | Sender address shown in the `From` header |

**Local DATABASE_URL:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reviewtrack"
```

---

## Database Design

Four models with soft deletes on `User` and `Application`.

```
User
  id, firstName, lastName, email (unique), passwordHash
  role: APPLICANT | REVIEWER | ADMIN
  createdAt, updatedAt, deletedAt

Application
  id, title, description, status
  type, priority, amount, justification   ← optional metadata fields
  submittedAt                             ← set when DRAFT → SUBMITTED
  applicantId (→ User)
  createdAt, updatedAt, deletedAt

Review                                    ← reviewer comments
  id, comment, applicationId (→ Application), reviewerId (→ User)
  createdAt, updatedAt

AuditLog                                  ← immutable status change history
  id, applicationId (→ Application), changedBy (→ User)
  fromStatus, toStatus, createdAt
```

Every status transition writes an `AuditLog` row in the same database transaction, so the history is always consistent with the application state.

---

## API Overview

Full interactive docs at `/api/docs`. Summary:

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Returns a JWT |
| GET | `/me` | Current user profile |
| POST | `/logout` | Semantic logout (client discards token) |

### Applicant — `/api/applications`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create application (DRAFT) |
| GET | `/my` | List own applications |
| GET | `/:id` | Get own application by ID |
| PATCH | `/:id` | Edit DRAFT or CHANGES_REQUESTED application |
| DELETE | `/:id` | Soft-delete a DRAFT |
| PATCH | `/:id/submit` | Submit for review (DRAFT → SUBMITTED) |

### Reviewer — `/api/reviewer`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | List all applications |
| GET | `/applications/:id` | Get application by ID |
| POST | `/applications/:id/start-review` | SUBMITTED → UNDER_REVIEW |
| POST | `/applications/:id/approve` | UNDER_REVIEW → APPROVED |
| POST | `/applications/:id/reject` | UNDER_REVIEW → REJECTED |
| POST | `/applications/:id/return` | UNDER_REVIEW → CHANGES_REQUESTED |

### Shared
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/applications/:id/comments` | Add comment (REVIEWER/ADMIN) |
| GET | `/api/applications/:id/events` | Activity timeline (status changes + comments) |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `401` | Authentication required (missing or invalid token) |
| `403` | Forbidden (authenticated but wrong role) |
| `404` | Resource not found |
| `422` | Validation error or illegal state transition |
| `500` | Unexpected server error |

---

## Middleware

The request pipeline uses five middleware layers, applied in this order:

### `protect` — JWT authentication
Reads the `Authorization: Bearer <token>` header, verifies the JWT signature using `JWT_SECRET`, and attaches the decoded payload (`id`, `email`, `role`) to `req.user`. Returns `401` if the header is missing or the token is invalid. All protected routes use this middleware.

### `requireRole` / `requireApplicant` / `requireReviewer`
Checks that `req.user.role` matches one of the permitted roles. Returns `403` if the role is not allowed. Pre-built shorthands (`requireApplicant`, `requireReviewer`) wrap the generic `requireRole` factory. Applied after `protect` on role-restricted routes.

### `validate`
Runs `validationResult` from `express-validator` after a chain of field validators has been attached to a route. If any validator fails it collects all error messages, sets the status to `422`, and forwards a single joined error to the error handler. Used on `POST /login` and any route with a request body schema.

### `notFound`
Catch-all registered after all routes. Sets the status to `404` and forwards an error message containing the requested URL. Ensures unmatched paths return a consistent JSON error rather than an Express default HTML page.

### `errorHandler`
Global Express error handler (four-argument signature). Normalizes the status code — if `res.statusCode` is still `200` when an error reaches this handler it defaults to `500`. Responds with `{ success: false, message }`. In `development` mode it also includes the stack trace.

---

## Workflow Explanation

Applications move through a strict state machine. Invalid transitions are rejected with `422`.

```
DRAFT ──────────────────────────────► SUBMITTED
  ▲                                       │
  │                                       ▼
  └──── CHANGES_REQUESTED ◄─────── UNDER_REVIEW ──► APPROVED
           │    ▲                         │
           │    └── Applicant edits       └──────────► REJECTED
           ▼
        SUBMITTED
```

| From | To | Who |
|------|----|-----|
| `DRAFT` | `SUBMITTED` | Applicant — submit |
| `SUBMITTED` | `UNDER_REVIEW` | Reviewer — start review |
| `SUBMITTED` | `CHANGES_REQUESTED` | Reviewer — return before review |
| `UNDER_REVIEW` | `APPROVED` | Reviewer |
| `UNDER_REVIEW` | `REJECTED` | Reviewer |
| `UNDER_REVIEW` | `CHANGES_REQUESTED` | Reviewer — return for changes |
| `CHANGES_REQUESTED` | `DRAFT` | Applicant — editing re-opens as draft |
| `CHANGES_REQUESTED` | `SUBMITTED` | Applicant — re-submit directly |

Only reviewers can move an application into `CHANGES_REQUESTED`. Only applicants can move it out (by editing or re-submitting). This ensures reviewers cannot skip the applicant edit step by sending applications directly back to `DRAFT`.

### How transitions are enforced

The allowed moves are declared as a single lookup table in `src/services/workflow.ts`:

```ts
const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT:              [SUBMITTED],
  SUBMITTED:          [UNDER_REVIEW, CHANGES_REQUESTED],
  CHANGES_REQUESTED:  [DRAFT, SUBMITTED],
  UNDER_REVIEW:       [APPROVED, REJECTED, CHANGES_REQUESTED],
  APPROVED:           [],
  REJECTED:           [],
};
```

`canTransition(fromStatus, toStatus)` does a single array-inclusion check against this table. Both `applicationController.ts` (applicant-facing actions) and `reviewerController.ts` (reviewer-facing actions) call it before delegating to the service layer. If the check fails the controller returns `422` immediately, so the database is never touched.

Once `canTransition` passes, `updateApplicationStatus` in `src/services/applicationService.ts` writes the new status and an `AuditLog` row in a **single Prisma `$transaction`**, guaranteeing atomicity — the audit history is always consistent with the current application state.

---

## Email Notifications

Status change emails are sent via **Nodemailer** (`src/services/notificationService.ts`). Notifications are fire-and-forget — they run after the database transaction commits and never block or fail the API response.

### When emails are sent

An email is sent for four status transitions:

| Status | Subject |
|--------|---------|
| `UNDER_REVIEW` | Your application is under review |
| `APPROVED` | Your application has been approved |
| `REJECTED` | Your application has been rejected |
| `CHANGES_REQUESTED` | Changes requested on your application |

`DRAFT` and `SUBMITTED` transitions do not trigger an email.

### Template

HTML templates are built in `src/utils/emailTemplates.ts`. `buildStatusEmail(firstName, applicationTitle, status)` returns both an `html` body and a plain-text `text` fallback. The HTML uses a table-based layout with inline styles for broad email client compatibility. Each status is represented by a colored badge pill:

| Status | Color |
|--------|-------|
| UNDER_REVIEW | Green |
| APPROVED | Green |
| REJECTED | Red |
| CHANGES_REQUESTED | Warm brown |

User-supplied content (application title) is HTML-escaped before interpolation to prevent injection.

### Configuration

Set the four SMTP variables in `.env`. Emails are silently skipped when `SMTP_USER` is not set, so the service works in development without any mail configuration.

For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) (requires 2-step verification) and use it as `SMTP_PASS`.

---

## Security

- **Passwords** hashed with `bcrypt` before storage — plain-text passwords are never persisted
- **JWT authentication** — stateless tokens signed with `JWT_SECRET`; all protected routes require a valid token
- **Role-based authorization** — `requireRole` middleware enforces that only the correct role can reach each route
- **Input validation** — `express-validator` chains validate and sanitize all user-supplied request fields before they reach business logic
- **SQL injection protection** — all database access goes through Prisma's parameterized query builder; raw SQL is not used
- **Secrets in environment variables** — no credentials are hardcoded; `.env` is excluded from version control

---

## Testing

```bash
# Run all tests
npm test

# Unit tests only (with coverage)
npm run test:unit

# Integration tests only
npm run test:integration

# Full coverage report
npm run test:coverage
```

**Test coverage:**

| Suite | What it covers |
|-------|---------------|
| `tests/unit/workflow.test.ts` | State machine — all valid and invalid transitions |
| `tests/unit/auth.test.ts` | `protect` middleware and `requireRole` |
| `tests/unit/application.test.ts` | Applicant controller endpoints |
| `tests/unit/responseHelper.test.ts` | Response formatting utility |
| `tests/integration/health.test.ts` | Health endpoint smoke test |

---

## Deployment

| Layer | Platform |
|-------|----------|
| Frontend | Vercel |
| Backend API | Render |
| Database | Prisma Postgres (managed) |

The production Docker image uses a multi-stage build — TypeScript is compiled in the build stage and only the compiled output and production `node_modules` are copied to the final image, keeping the image size small.

---

## Trade-offs

**Stateless JWT with no token blacklist** — logout is client-side only. A proper server-side logout would require a token blocklist (Redis or a DB table). Not implemented to keep the infrastructure simple; the short token expiry (`JWT_EXPIRES_IN`) mitigates the risk.

**Soft deletes on Application** — deleted records remain in the database. This simplifies audit trail consistency and avoids cascading foreign key issues, but requires all queries to filter `deletedAt IS NULL` if that becomes a concern at scale.

**Single `Review` model for comments** — the schema uses `Review` for reviewer comments rather than a separate `Comment` model. This is sufficient for the current workflow but conflates structured feedback with freeform comments.

**`type` and `priority` as plain strings** — kept flexible to avoid premature enum constraints while the product design finalises the exact values. Should be migrated to enums once values are stable.

**No pagination** — `GET /api/applications` returns all records. Acceptable for a small dataset; needs cursor or offset pagination before scaling.

**422 over 403 for invalid state transitions** — the requirements spec suggested 403 (Forbidden) when a transition is not permitted (e.g. `DRAFT → APPROVED`). 422 (Unprocessable Entity) is more accurate: the request is authenticated and authorized — the problem is that the business logic cannot honour it. 403 implies a permission failure, which would mislead clients into thinking they lack access rather than that the payload is semantically invalid.

---

## AI Usage

This project was built with AI assistance (Claude) throughout:


- **OpenAPI documentation** — Scalar docs generated alongside each endpoint
- **Test fixes** — identifying and resolving a pre-existing JWT secret mismatch in the test environment
- **Schema evolution** — planning and writing Prisma migrations for new fields

All generated code was reviewed and the architectural decisions (state machine design, soft deletes, audit logging strategy) were made by the developer.

---

## Future Improvements

- **Pagination** on list endpoints (cursor-based)
- **Token blacklist** for real server-side logout
- **File attachments** on applications (S3/object storage)
- **Admin endpoints** — user management, bulk actions, reporting
- **Rate limiting** on auth endpoints
- **`type` and `priority` enums** once design values are finalised
- **Refresh tokens** to extend sessions without re-login
