// backend/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { adminLoginSchema } = require('../validators/schemas');
const authController = require('../controllers/authController');

router.post('/login', validate(adminLoginSchema), authController.adminLogin);
router.get('/me', adminAuth, authController.adminMe);

router.use(adminAuth);

router.get('/dashboard', adminController.getDashboard);
router.get('/receipts', adminController.getReceipts);
router.post('/receipts/:id/approve', adminController.approveReceipt);
router.post('/receipts/:id/reject', adminController.rejectReceipt);

module.exports = router;