// backend/seed.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN', passwordHash: adminPassword },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash: userPassword },
    create: {
      email: 'test@example.com',
      passwordHash: userPassword,
      name: 'Test User',
      role: 'USER'
    }
  });
  console.log('Test user created:', user.email);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });