// backend/src/utils/errors.js
// Application error with a stable machine-readable code.

class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

const AppErrors = {
  invalidCredentials: () => new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid credentials'),
  unauthorized: (msg = 'Authentication required') => new AppError(401, 'AUTH_UNAUTHORIZED', msg),
  forbidden: (msg = 'You do not have access to this resource') => new AppError(403, 'AUTH_FORBIDDEN', msg),
  notFound: (msg = 'Resource not found') => new AppError(404, 'RESOURCE_NOT_FOUND', msg),
  receiptDuplicate: () => new AppError(409, 'RECEIPT_DUPLICATE', 'A receipt with this Order ID already exists'),
  receiptProcessed: (msg = 'Receipt has already been processed') => new AppError(409, 'RECEIPT_ALREADY_PROCESSED', msg),
  voucherRedeemed: () => new AppError(409, 'VOUCHER_ALREADY_REDEEMED', 'Voucher has already been redeemed'),
  voucherExpired: () => new AppError(400, 'VOUCHER_EXPIRED', 'Voucher has expired'),
  validation: (details) => new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details),
  badRequest: (msg) => new AppError(400, 'BAD_REQUEST', msg),
  rateLimited: () => new AppError(429, 'RATE_LIMITED', 'Too many requests. Please slow down.'),
};

module.exports = { AppError, AppErrors };
