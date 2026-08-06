import { LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS } from "@/backend/auth/constants";

/**
 * Fixed-window rate limiter for authentication endpoints.
 *
 * In-process by design for now: it protects a single instance against
 * credential stuffing without adding infrastructure. When the deployment scales
 * beyond one instance, this module is the single place to swap in a shared
 * store (Redis) — callers do not change.
 */

interface Window {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, Window>();

/** Removes expired windows so the map cannot grow without bound. */
function sweep(now: number): void {
  for (const [key, window] of attempts) {
    if (window.resetAt <= now) {
      attempts.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** Records an attempt against `key` and reports whether it may proceed. */
export function consumeLoginAttempt(key: string): RateLimitResult {
  const now = Date.now();

  if (attempts.size > 1000) {
    sweep(now);
  }

  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > LOGIN_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Clears the window after a successful sign-in. */
export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}
