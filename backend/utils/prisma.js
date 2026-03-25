import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const globalForPrisma = globalThis;

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

  // Try an eager connect in development, but never crash the process on initial auth/network errors.
  if (process.env.NODE_ENV !== 'production') {
    client.$connect().catch((error) => {
      console.error('[Prisma] Initial connection failed:', error.message);
    });
  }
  
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
