import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { requireEnv } from "@/lib/env";

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
  });
}

// Reuse a single client across hot reloads in development; Next.js re-imports
// modules on every change and each PrismaClient holds its own connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
