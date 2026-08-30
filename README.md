# Loyalty Program

A full-stack loyalty program for the Junior Developer Take-Home Assessment. Users register, upload purchase receipts, and — once an admin approves a receipt — automatically earn a voucher.

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
backend/      Express API, Prisma schema, seed
frontend/     React SPA (built to frontend/dist)
proxy.js      Static file server + /api,/uploads reverse proxy (port 8080)
```
