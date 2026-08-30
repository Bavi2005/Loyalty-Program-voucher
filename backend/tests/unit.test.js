// backend/tests/unit.test.js
// Unit tests for validation schemas and pure logic (no DB required).

const { z } = require('zod');
const {
  registerSchema,
  loginSchema,
  uploadReceiptSchema,
  updateProfileSchema,
} = require('../src/validators/schemas');

describe('registerSchema', () => {
  it('accepts valid input', async () => {
    const parsed = await registerSchema.parseAsync({
      body: { name: 'Jane', email: 'jane@example.com', password: 'secret1' },
      query: {},
      params: {},
    });
    expect(parsed.body.email).toBe('jane@example.com');
  });

  it('rejects bad email', async () => {
    await expect(
      registerSchema.parseAsync({
        body: { name: 'Jane', email: 'not-an-email', password: 'secret1' },
        query: {},
        params: {},
      })
    ).rejects.toThrow();
  });

  it('rejects short password', async () => {
    await expect(
      registerSchema.parseAsync({
        body: { email: 'a@b.com', password: '123' },
        query: {},
        params: {},
      })
    ).rejects.toThrow();
  });
});

describe('uploadReceiptSchema', () => {
  it('coerces amount string to number and validates positivity', async () => {
    const parsed = await uploadReceiptSchema.parseAsync({
      body: { orderId: 'A1', purchaseDate: '2026-08-30', amount: '19.99' },
      query: {},
      params: {},
    });
    expect(parsed.body.amount).toBe(19.99);
  });

  it('rejects zero/negative amounts', async () => {
    await expect(
      uploadReceiptSchema.parseAsync({
        body: { orderId: 'A1', purchaseDate: '2026-08-30', amount: '0' },
        query: {},
        params: {},
      })
    ).rejects.toThrow();
  });

  it('rejects invalid date', async () => {
    await expect(
      uploadReceiptSchema.parseAsync({
        body: { orderId: 'A1', purchaseDate: 'not-a-date', amount: '10' },
        query: {},
        params: {},
      })
    ).rejects.toThrow();
  });
});

describe('updateProfileSchema', () => {
  it('requires current password when changing password', async () => {
    await expect(
      updateProfileSchema.parseAsync({
        body: { newPassword: 'newpassword1' },
        query: {},
        params: {},
      })
    ).rejects.toThrow();
  });

  it('passes with both current + new password', async () => {
    const parsed = await updateProfileSchema.parseAsync({
      body: { currentPassword: 'old12345', newPassword: 'new12345' },
      query: {},
      params: {},
    });
    expect(parsed.body.newPassword).toBe('new12345');
  });
});
