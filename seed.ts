import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice',
      email: 'alice@example.com',
      password: pass,
      role: 'STUDENT',
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      email: 'bob@example.com',
      password: pass,
      role: 'STAFF',
    },
  });

  console.log('✅ Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
