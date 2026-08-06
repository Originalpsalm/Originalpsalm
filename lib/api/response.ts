import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { ApiFailure, ApiSuccess } from "@/types/api";

/**
 * API response helpers (ADR-0007).
 *
 * Every route handler returns through these — one envelope, real HTTP
 * status codes, no exceptions leaking to the client.
 */

export function ok<T>(
  data: T,
  message = "OK",
  init?: { status?: number },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { success: true as const, message, data },
    { status: init?.status ?? 200 },
  );
}

export function created<T>(data: T, message = "Created."): NextResponse<ApiSuccess<T>> {
  return ok(data, message, { status: 201 });
}

export function failFromAppError(error: AppError): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      success: false as const,
      message: error.message,
      code: error.code,
      errors: error.errors,
    },
    { status: error.status },
  );
}

function failUnexpected(error: unknown): NextResponse<ApiFailure> {
  const correlationId = crypto.randomUUID();

  // Full detail stays server-side; the client gets a sanitized message
  // plus a correlation ID that finds this log line.
  logger.error("Unhandled error in route handler", {
    correlationId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      success: false as const,
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
      errors: {},
      correlationId,
    },
    { status: 500 },
  );
}

type RouteContext<P> = { params: Promise<P> };

/**
 * Wraps a route handler with the standard error boundary:
 * AppError → its envelope and status; anything else → sanitized 500.
 */
export function handleRoute<P = Record<string, never>>(
  handler: (request: Request, context: RouteContext<P>) => Promise<NextResponse>,
) {
  return async (request: Request, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof AppError) {
        return failFromAppError(error);
      }

      return failUnexpected(error);
    }
  };
}
