
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';



console.log('database URL:', process.env.DATABASE_URL);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SEED_USERS = [
  {
    firstName: 'Alice',
    lastName: 'Applicant',
    email: 'applicant@example.com',
    password: 'password123',
    role: 'APPLICANT' as const,
  },
  {
    firstName: 'Robert',
    lastName: 'Reviewer',
    email: 'reviewer@example.com',
    password: 'password123',
    role: 'REVIEWER' as const,
  },
  {
    firstName: 'Ada',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'ADMIN' as const,
  },
];

async function main() {
  console.log('Seeding users...');

  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });

    console.log(`  [${created.role}] ${created.email} (id: ${created.id})`);
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
