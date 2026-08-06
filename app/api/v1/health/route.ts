import { NextResponse } from "next/server";

import { ok } from "@/lib/api/response";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { ApiFailure } from "@/types/api";

/**
 * GET /api/v1/health — liveness and database reachability for monitoring
 * (ADR-0009). Returns 200 when healthy, 503 when the database is down.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    logger.error("Health check: database unreachable", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json<ApiFailure>(
      {
        success: false,
        message: "Service degraded: database unreachable.",
        code: "HEALTH_DEGRADED",
        errors: {},
      },
      { status: 503 },
    );
  }

  return ok({ status: "ok", database: "up" }, "Healthy.");
}
