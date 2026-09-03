# Loyalty Program

A full-stack Loyalty Program built for a Junior Developer Take-Home Assessment.

Users can register using an email address or phone number, submit purchase receipts, track their review status, and automatically receive a voucher when an administrator approves a receipt.

The application uses React, Node.js, Express, Prisma and PostgreSQL.

## Live Demo

**User application**

https://loyalty-program-voucher.onrender.com/

Demo user:

```text
Email: test@example.com
Password: password123
```

You can also create a new account.

**Admin application**

https://loyalty-program-voucher.onrender.com/admin/login

Demo administrator:

```text
Email: admin@example.com
Password: admin123
```

### Render cold start

The demo is hosted using a free Render instance.

If the application has been inactive, the first request may take approximately **50–60 seconds** while the service starts.

After the initial load, normal requests should respond normally.

The credentials above are demonstration accounts only.

---

## Main Features

### User

* Register using an email address or phone number
* Login and logout
* Passwords stored using bcrypt hashing
* View dashboard statistics
* Upload JPG, PNG or PDF receipts
* Track pending, approved and rejected receipts
* View uploaded receipt details
* Receive a voucher automatically after receipt approval
* View active, redeemed and expired vouchers
* Redeem available vouchers
* Update profile information
* Change password

### Administrator

* Separate administrator authentication
* View receipt statistics
* View submitted receipt files
* Search submitted receipts
* Filter receipts by status
* Paginated receipt list
* Approve pending receipts
* Reject pending receipts
* Automatically issue one voucher after approval

---

## Business Rules

Business rules are enforced by the backend.

1. Every newly submitted receipt starts as `PENDING`.
2. Only an administrator can approve or reject receipts.
3. Users can only access their own receipts and vouchers.
4. An approved receipt generates exactly one voucher.
5. A rejected receipt generates no voucher.
6. Repeating approval on an already approved receipt must not create another voucher.
7. A voucher can only be redeemed by its owner.
8. An already redeemed voucher cannot be redeemed again.

The database also enforces a unique relationship between a receipt and its voucher.

---

## Technology Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* React Router
* React Hook Form
* Zod
* Axios
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express
* Prisma ORM
* Zod
* JWT authentication
* bcrypt
* Multer
* Helmet
* Express Rate Limit

### Database

* PostgreSQL
* Supabase PostgreSQL for the deployed demo

### Deployment

* Docker
* Render

---

## Architecture

```text
Browser
   │
   ▼
Public application :8080
   │
   ├── React production build
   │
   └── proxy.js
          │
          ├── /api
          ├── /uploads
          ├── /health
          └── /ready
                    │
                    ▼
              Express API :5000
                    │
                    ▼
                Prisma
                    │
                    ▼
               PostgreSQL
```

The backend follows a small layered structure:

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Prisma
  ↓
PostgreSQL
```

The project intentionally remains a modular monolith because additional services would add unnecessary complexity for the scope of this assessment.

---

## Important Design Decisions

### Exactly one voucher per approved receipt

Receipt approval is handled inside a Prisma transaction.

The application atomically changes a receipt from `PENDING` to `APPROVED` before creating its voucher.

The database also defines `Voucher.receiptId` as unique.

This gives two levels of protection against accidentally creating multiple vouchers for the same receipt.

### Backend authorization

Protected routes do not rely only on frontend navigation.

JWT authentication is validated by Express middleware.

Administrator routes also verify that the current database account still has the `ADMIN` role.

### User isolation

Receipt and voucher queries are scoped using the authenticated user's database ID.

A user therefore cannot request another user's receipts simply by changing a frontend value or URL.

### Validation

Zod is used for request validation.

The application handles cases including:

* invalid login credentials
* duplicate registration
* missing receipt information
* invalid purchase amount
* invalid receipt file type
* duplicate order ID
* receipt not found
* unauthorized access
* repeated approval
* expired vouchers
* already redeemed vouchers

### Receipt uploads

Receipt files are uploaded with Multer.

Accepted file types:

* JPEG
* PNG
* PDF

The assessment deployment uses local filesystem storage.

The database stores a public `/uploads/...` path instead of the container's physical filesystem location.

---

## Database Model

The application contains three main models:

```text
User
 ├── Receipt[]
 └── Voucher[]

Receipt
 ├── belongs to User
 └── has zero or one Voucher

Voucher
 ├── belongs to User
 └── belongs to exactly one Receipt
```

Receipt states:

```text
PENDING
APPROVED
REJECTED
```

User roles:

```text
USER
ADMIN
```

---

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### User

```text
GET  /api/user/dashboard
GET  /api/user/receipts
POST /api/user/receipts
GET  /api/user/vouchers
POST /api/user/vouchers/:id/redeem
PUT  /api/user/profile
```

### Administrator

```text
POST /api/admin/login
GET  /api/admin/me
GET  /api/admin/dashboard
GET  /api/admin/receipts
POST /api/admin/receipts/:id/approve
POST /api/admin/receipts/:id/reject
```

### Health

```text
GET /health
GET /ready
```

`/health` confirms that the application process is running.

`/ready` additionally checks PostgreSQL connectivity.

---

## Local Setup

### Requirements

* Node.js 20+
* PostgreSQL

Clone the repository:

```bash
git clone https://github.com/Bavi2005/Loyalty-Program-voucher.git

cd Loyalty-Program-voucher
```

Install the root dependency:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend

npm install
```

Create the backend environment file:

```bash
cp .env.example .env
```

Update `.env` with a PostgreSQL connection string and secure JWT secret.

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty"
JWT_SECRET="replace-this-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=5000
CLIENT_URL="http://localhost:8080"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
```

Apply the database migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed the demonstration accounts:

```bash
npm run seed
```

Install and build the frontend:

```bash
cd ../frontend

npm install
npm run build
```

Start the complete application:

```bash
cd ..

node start.js
```

Open:

```text
http://localhost:8080
```

---

## Testing

### Backend unit tests

```bash
cd backend

npm run test:unit
```

### Integration tests

The integration test suite uses a real PostgreSQL database.

Use a disposable test database and never point the integration suite at production data.

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty_test" npm test
```

The tests cover areas including:

* email registration
* phone-only registration
* authentication
* duplicate registration
* invalid credentials
* invalid JWTs
* receipt submission
* receipt validation
* duplicate order IDs
* user data isolation
* administrator authorization
* concurrent receipt approval
* exactly-one-voucher behavior
* rejection without voucher creation
* voucher redemption

### Frontend

```bash
cd frontend

npm run lint
npm run build
```

---

## Docker

The application can also be started using Docker Compose:

```bash
docker compose up --build
```

The application will be available at:

```text
http://localhost:8080
```

---

## Assessment / Production Trade-offs

This application was created as a time-limited technical assessment, so several choices intentionally favour simplicity.

### Monetary values

Receipt amounts currently use Prisma `Float`.

For a production financial application I would use fixed-precision `Decimal` values or integer cents.

### Receipt storage

The assessment allows local receipt storage, which is what this implementation uses.

The Render filesystem is not suitable for permanent production document storage and uploaded files may not survive service replacement or redeployment.

For production I would use private object storage such as Supabase Storage, Amazon S3 or Cloudflare R2 and store only the object identifier in PostgreSQL.

### Upload security

The application validates upload size and MIME type.

A production system should additionally verify file signatures/magic bytes and may include malware scanning.

### Authentication storage

JWT authentication is used for the assessment SPA.

For a larger production system I would also evaluate HttpOnly cookies, refresh-token rotation, revocation strategy and CSRF protection depending on the final architecture.

### Frontend bundle

The assessment is delivered as a small single-page application.

For a larger application I would introduce route-level lazy loading and code splitting.

---

## AI Assistance

AI-assisted development tools were used to help accelerate scaffolding, UI iteration, debugging and code review.

The final code was reviewed, modified and tested as part of the development process, and I can explain the implementation, database design, API decisions, business rules and technical trade-offs used in the project.
