import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/backend/auth/constants";
import { AuthService } from "@/backend/auth/service";
import type { AuthContext, RequestMeta } from "@/backend/auth/types";

/**
 * Server-side session helpers: cookie handling and per-request auth resolution.
 */

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Strict blocks the cookie on cross-site requests, which is the primary
    // CSRF defence for a cookie-carried session (Security spec).
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Resolves the current caller, or null when not signed in. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await readSessionToken();

  if (!token) {
    return null;
  }

  return new AuthService().resolveSession(token);
}

/** Extracts client IP and user agent for session and audit records. */
export function requestMeta(request: Request): RequestMeta {
  const forwarded = request.headers.get("x-forwarded-for");

  return {
    ipAddress: forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  };
}
