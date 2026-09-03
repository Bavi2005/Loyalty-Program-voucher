require('dotenv').config();
const config = require('./config'); // validates env on load; exits fast if misconfigured
const logger = require('./logging/logger');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = config.PORT;
app.set('trust proxy', 1); // correct client IPs behind proxy.js / reverse proxies

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || config.CLIENT_URL)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser clients (curl/same-origin) and configured origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Never cache JSON responses. Express adds a weak ETag and returns 304 on
// revalidation, which made GET /api/admin/receipts arrive with an empty body
// and left the admin list blank.
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Serve uploaded files (also uncached, so receipt views don't go stale)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness (checks DB connectivity)
app.get('/ready', async (req, res) => {
  try {
    const prisma = require('./utils/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Serve the built React app in production (single-process deploy).
// In dev the frontend is served by Vite / proxy.js, so this is a no-op when
// the build output is absent.
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/ready')
    ) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  // API-only root (e.g. tests / backend-only deploy)
  app.get('/', (req, res) => {
    res.json({ message: 'Loyalty Program API is running!' });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handling: Zod → 400, Prisma/multer mapped, unknown → 500
const errorHandler = require('./middleware/errorHandler');
app.use((err, req, res, next) => {
  logger.error('request_error', { message: err.message, code: err.code, path: req.path });
  errorHandler(err, req, res, next);
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info('server_started', { port: PORT, env: config.NODE_ENV });
  });
}

module.exports = app;