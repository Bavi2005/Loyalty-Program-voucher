// backend/src/server.js

require('dotenv').config();
const config = require('./config'); // validates env on load; exits fast if misconfigured
const logger = require('./logging/logger');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
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

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Loyalty Program API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('unhandled_error', { message: err.message, code: err.code });

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size exceeds limit (5MB)' });
  }
  if (err.message === 'Invalid file type') {
    return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and PDF allowed.' });
  }

  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info('server_started', { port: PORT, env: config.NODE_ENV });
});

module.exports = app;