# Review Track — Backend API

REST API for a multi-role application review platform. Applicants submit requests; reviewers manage them through a defined workflow with a full audit trail.

---

## Table of Contents

- [Installation](#installation)
- [Docker Instructions](#docker-instructions)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Database Design](#database-design)
- [API Overview](#api-overview)
- [Workflow Explanation](#workflow-explanation)
- [Trade-offs](#trade-offs)
- [AI Usage](#ai-usage)
- [Future Improvements](#future-improvements)

---

## Installation

**Prerequisites:** Node.js 22+, Docker

```bash
git clone <repo-url>
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
| `RESEND_API_KEY` | No | — | Resend API key. Email notifications are skipped when not set. |
| `FROM_EMAIL` | No | `notifications@yourdomain.com` | Sender address (must be a verified Resend domain in prod) |

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

## Workflow Explanation

Applications move through a strict state machine. Invalid transitions are rejected with `422`.

```
DRAFT ──────────────────────────────► SUBMITTED
  ▲                                       │
  │                                       ▼
CHANGES_REQUESTED ◄────────── UNDER_REVIEW ──► APPROVED
                                       │
                                       └──────► REJECTED
```

| From | To | Who |
|------|----|-----|
| DRAFT | SUBMITTED | Applicant (submit) |
| SUBMITTED | UNDER_REVIEW | Reviewer (start-review) |
| SUBMITTED | CHANGES_REQUESTED | Reviewer (return) |
| UNDER_REVIEW | APPROVED | Reviewer |
| UNDER_REVIEW | REJECTED | Reviewer |
| UNDER_REVIEW | CHANGES_REQUESTED | Reviewer (return) |
| CHANGES_REQUESTED | DRAFT | Applicant (edit unlocks draft) |

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

- **Scaffolding** — initial project structure, middleware, and service patterns
- **Endpoint implementation** — controller, service, and route boilerplate following established patterns
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
