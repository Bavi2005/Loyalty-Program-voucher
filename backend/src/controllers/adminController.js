// backend/src/controllers/adminController.js

const prisma = require('../utils/prisma');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      pendingReceipts,
      approvedReceipts,
      rejectedReceipts,
      vouchersIssued
    ] = await Promise.all([
      prisma.receipt.count({ where: { status: 'PENDING' } }),
      prisma.receipt.count({ where: { status: 'APPROVED' } }),
      prisma.receipt.count({ where: { status: 'REJECTED' } }),
      prisma.voucher.count()
    ]);

    res.json({
      pendingReceipts,
      approvedReceipts,
      rejectedReceipts,
      vouchersIssued
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceipts = async (req, res, next) => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          voucher: true
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.receipt.count({ where })
    ]);

    res.json({
      receipts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Single atomic transaction: re-check status inside to guarantee
    // exactly one voucher is ever created (idempotent under concurrency).
    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id },
        include: { voucher: true }
      });

      if (!receipt) {
        const err = new Error('Receipt not found');
        err.status = 404;
        throw err;
      }

      // Already processed → return current state without creating a new voucher
      if (receipt.status === 'APPROVED') {
        return { receipt, voucher: receipt.voucher, alreadyApproved: true };
      }

      if (receipt.status === 'REJECTED') {
        const err = new Error('Receipt is already rejected and cannot be approved');
        err.status = 400;
        throw err;
      }

      const updatedReceipt = await tx.receipt.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date() }
      });

      // Set an expiry date (e.g. 90 days) for the voucher — optional enhancement
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      const voucher = await tx.voucher.create({
        data: {
          userId: receipt.userId,
          receiptId: receipt.id,
          expiresAt
        }
      });

      return { receipt: updatedReceipt, voucher };
    });

    res.json({
      message: result.alreadyApproved
        ? 'Receipt was already approved — no new voucher created'
        : 'Receipt approved and voucher generated',
      receipt: result.receipt,
      voucher: result.voucher
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.receipt.findUnique({
      where: { id }
    });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status !== 'PENDING') {
      return res.status(400).json({ 
        message: `Receipt is already ${receipt.status.toLowerCase()}` 
      });
    }

    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    res.json({
      message: 'Receipt rejected',
      receipt: updatedReceipt
    });
  } catch (error) {
    next(error);
  }
};