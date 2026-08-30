// backend/src/routes/authRoutes.js

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../validators/schemas');
const config = require('../config');

// Brute-force protection on credential endpoints
const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  limit: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', auth, authController.me);

module.exports = router;