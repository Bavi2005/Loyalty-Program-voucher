# Loyalty Program

A full-stack loyalty program for the Junior Developer Take-Home Assessment. Users register, upload purchase receipts, and — once an admin approves a receipt — automatically earn a voucher.

this repo is deployed by render and supabase you can check it out on  here

user login
https://loyalty-program-voucher.onrender.com/
for user you can sign up and check it all out

admin login:
https://loyalty-program-voucher.onrender.com/admin/login
for admin you can use these
Email: admin@example.com
Password: admin123

[![CI](https://github.com/Bavi2005/Loyalty-Program-voucher/actions/workflows/ci.yml/badge.svg)](https://github.com/Bavi2005/Loyalty-Program-voucher/actions/workflows/ci.yml)

## Stack

- **Frontend**: React 18 + Vite, Tailwind CSS v4, React Hook Form + Zod
- **Backend**: Node.js + Express, Prisma ORM
- **Database**: PostgreSQL (required by spec)
- **Auth**: JWT (access token), bcrypt password hashing

## Features

- Email/phone registration, login, logout (hashed passwords)
- Dashboard: welcome, pending/approved receipts, available vouchers, total spent
- Upload receipt (image + order ID + purchase date + amount) → starts as `PENDING`
- Receipt history (own receipts only) with image preview
- Vouchers page with redemption + expiry states
- Account settings (profile + password change)
- Separate admin auth, admin dashboard (pending/approved/rejected/vouchers issued)
- Receipt validation: approve → exactly one voucher issued; reject → none
- **Idempotent approval** enforced inside a DB transaction (rule #6)
- Admin search / status filter / pagination
- Toast notifications, vibrant responsive UI

## Business rules (enforced server-side)

1. New receipts are `PENDING`.
2. Only admins can approve/reject.
3. Users see only their own receipts/vouchers.
4. Approved receipt → exactly one voucher; rejected → none.
5. Already-processed receipt → no second voucher (re-approve is a no-op).
6. Backend is the single source of truth for all of the above.

## Architecture

```
React SPA (built to dist/)
        │  (browser talks to ONE port)
        ▼
proxy.js — static files + reverse proxy for /api and /uploads  →  port 8080
        ▼
Express API (port 5000)  →  Prisma ORM  →  PostgreSQL
```

Layering inside the backend: `routes → middleware (auth, validate, rate-limit) → controllers → Prisma → PostgreSQL`.
Zod validates every request body before a controller ever runs; JWT middleware enforces authentication, and `role` claims enforce admin-only routes.

## Key design decisions

- **Exactly-one-voucher invariant**: approval is a single Prisma `$transaction` that re-reads receipt status inside the transaction, updates the receipt to `APPROVED`, and creates the voucher. Re-approving reads `APPROVED` and returns the existing voucher instead of creating another — idempotent even under concurrent requests. `Voucher.receiptId` also has a `UNIQUE` constraint as a database-level backstop.
- **Fail-fast config**: `backend/src/config` validates all environment variables at boot (zod) and refuses to start on invalid configuration.
- **Structured logging**: JSON logs (`src/logging/logger.js`) instead of scattered `console.log`. Passwords/tokens are never logged.
- **Security posture**: helmet headers, zod input validation, bcrypt(12) password hashing, rate limiting on login/register and receipt upload, duplicate-order detection, file type/size validation, and role checks on every admin route.
- **Health probes**: `GET /health` (liveness) and `GET /ready` (checks the DB connection).

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (email/phone + password) |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/user/dashboard` | Pending/approved receipts, available vouchers, total spent |
| GET | `/api/user/receipts` | Own receipts (with linked voucher) |
| POST | `/api/user/receipts` | Upload receipt (multipart: image/pdf + orderId + purchaseDate + amount) |
| GET | `/api/user/vouchers` | Own vouchers |
| POST | `/api/user/vouchers/:id/redeem` | Redeem a voucher |
| PUT | `/api/user/profile` | Update profile / change password |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Global stats |
| GET | `/api/admin/receipts` | List receipts — pagination, status filter, search |
| POST | `/api/admin/receipts/:id/approve` | Approve → creates exactly one voucher (transactional, idempotent) |
| POST | `/api/admin/receipts/:id/reject` | Reject (no voucher) |
| GET | `/health`, `/ready` | Liveness / readiness |

Errors are JSON (`{ message }` + HTTP status): 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 duplicates / already processed.

## Environment variables

`backend/.env` (copy from `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret (≥ 16 chars enforced) |
| `JWT_EXPIRES_IN` | Token lifetime (default `12h`) |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Frontend origin |
| `MAX_FILE_SIZE` | Upload byte limit (default 5 MB) |
| `UPLOAD_DIR` | Where receipt files are stored |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX` | Rate limiting |

## AI usage note

AI-assisted tooling was used to accelerate scaffolding, UI iteration, and hardening; all code was reviewed, tested end-to-end, and is understood by the developer (see commit history).

## Prerequisites

- Node.js 18+
- A running PostgreSQL instance

## Setup

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev      # creates tables
node seed.js                # creates admin@example.com + test@example.com

# 2. Frontend
cd ../frontend
npm install
npm run build              # produces dist/ (served statically)

# 3. Run (single port)
cd ..
node proxy.js              # serves frontend on :8080 and proxies /api -> backend:5000
```

## Access

Open the forwarded **port 8080** in your browser. No separate dev servers required at runtime.

- User: `test@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`

## Project layout

```
backend/      Express API, Prisma schema, seed, tests
frontend/     React SPA (built to frontend/dist)
proxy.js      Static file server + /api,/uploads reverse proxy (port 8080)
```

## Testing

```bash
cd backend
# unit (validation)
npm run test:unit
# integration + concurrency (requires a test DB — CI uses a Postgres service)
DATABASE_URL="postgresql://loyalty_user:loyalty_pass@localhost:5432/loyalty_test?schema=public" \
  npm test
```

Suite covers: auth (valid/invalid/dup/unknown/401), receipt upload (type, size, dup order, invalid amount), admin-only actions (403 for users), **idempotent approval under 3× concurrent requests** (exactly one voucher), reject→no-voucher, voucher redeem (second redeem fails).

## Docker

```bash
docker compose up --build
```

Brings up PostgreSQL + backend (migrations + seed on start) + the single-port app on **http://localhost:8080**.

## CI/CD

- `.github/workflows/ci.yml` — installs, migrates a throwaway Postgres, runs the full test suite, builds the frontend.
- `.github/workflows/security.yml` — `npm audit` (high+) for backend & frontend, weekly.
- `.github/dependabot.yml` — weekly dependency PRs.
