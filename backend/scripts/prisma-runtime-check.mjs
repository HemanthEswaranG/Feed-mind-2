import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.user.findFirst({ select: { id: true } });
  console.log('PRISMA_RUNTIME_OK');
} catch (error) {
  console.error('PRISMA_RUNTIME_FAIL', error?.message ?? error);
} finally {
  await prisma.$disconnect();
}
