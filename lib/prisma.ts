import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { requireEnv } from "@/lib/env";

// A single client per process: Next.js re-imports modules on every change in
// development, and each PrismaClient holds its own connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Lazily-created Prisma client singleton.
 *
 * The client is constructed on first use — never at import time — so modules
 * can be imported during `next build` page-data collection without requiring
 * DATABASE_URL in the build environment (ADR-0009: builds never touch a
 * database).
 */
export function getPrisma(): PrismaClient {
  globalForPrisma.prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
  });

  return globalForPrisma.prisma;
}
