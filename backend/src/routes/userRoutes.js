// backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { updateProfileSchema, uploadReceiptSchema } = require('../validators/schemas');
const { upload } = require('../utils/upload');

router.use(auth);

router.get('/dashboard', userController.getDashboard);
router.get('/receipts', userController.getReceipts);
router.get('/vouchers', userController.getVouchers);
router.post('/vouchers/:id/redeem', userController.redeemVoucher);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/receipts', upload.single('receipt'), validate(uploadReceiptSchema), userController.uploadReceipt);

module.exports = router;