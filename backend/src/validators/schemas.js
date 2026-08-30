// backend/src/validators/schemas.js

const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
  }).refine(data => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: 'Current password is required to change password',
    path: ['currentPassword']
  })
});

const uploadReceiptSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    purchaseDate: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
    amount: z.coerce.number().positive('Amount must be positive'),
  })
});

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  uploadReceiptSchema,
  adminLoginSchema
};