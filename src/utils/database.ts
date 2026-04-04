/**
 * Database utility functions
 */

import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance to be used across the application
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Add connection health check
prisma.$on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };

// Export types for convenience
export type PrismaClientType = typeof prisma;