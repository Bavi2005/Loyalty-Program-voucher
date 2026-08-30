// backend/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      pendingReceipts,
      approvedReceipts,
      availableVouchers,
      totalSpent
    ] = await Promise.all([
      prisma.receipt.count({ where: { userId, status: 'PENDING' } }),
      prisma.receipt.count({ where: { userId, status: 'APPROVED' } }),
      prisma.voucher.count({ where: { userId } }),
      prisma.receipt.aggregate({
        where: { userId, status: 'APPROVED' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      pendingReceipts,
      approvedReceipts,
      availableVouchers,
      totalSpent: totalSpent._sum.amount || 0
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceipts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const receipts = await prisma.receipt.findMany({
      where: { userId },
      include: {
        voucher: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(receipts);
  } catch (error) {
    next(error);
  }
};

exports.getVouchers = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const vouchers = await prisma.voucher.findMany({
      where: { userId },
      include: {
        receipt: true
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(vouchers);
  } catch (error) {
    next(error);
  }
};

exports.redeemVoucher = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({ where: { id } });

    if (!voucher || voucher.userId !== userId) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    if (voucher.redeemedAt) {
      return res.status(400).json({ message: 'Voucher has already been redeemed' });
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Voucher has expired' });
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: { redeemedAt: new Date() },
      include: { receipt: true }
    });

    res.json({ message: 'Voucher redeemed successfully', voucher: updated });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email/phone already taken by another user
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    if (phone && phone !== user.phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return res.status(409).json({ message: 'Phone number already in use' });
      }
    }

    const updateData = { name, email, phone };

    // Handle password change
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

exports.uploadReceipt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, purchaseDate, amount } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    // Check for duplicate order ID for this user
    const existing = await prisma.receipt.findFirst({
      where: { userId, orderId }
    });

    if (existing) {
      return res.status(409).json({ message: 'Receipt with this Order ID already exists' });
    }

    const receipt = await prisma.receipt.create({
      data: {
        userId,
        orderId,
        purchaseDate: new Date(purchaseDate),
        amount: parseFloat(amount),
        imageUrl: req.file.path,
        status: 'PENDING'
      },
      include: {
        voucher: true
      }
    });

    res.status(201).json(receipt);
  } catch (error) {
    next(error);
  }
};