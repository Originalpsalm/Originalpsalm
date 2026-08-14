import "server-only";
import { headers } from "next/headers";

/**
 * A small in-memory sliding-window rate limiter.
 *
 * The app runs as a single Railway instance with one SQLite file, so
 * in-process state is sufficient — no Redis needed at this scale. Windows are
 * pruned lazily; memory stays bounded by the number of distinct keys seen in
 * the last window.
 */
type Window = { stamps: number[] };

const globalForLimits = globalThis as unknown as { guruLimits?: Map<string, Window> };
const buckets: Map<string, Window> = globalForLimits.guruLimits ?? new Map();
if (process.env.NODE_ENV !== "production") globalForLimits.guruLimits = buckets;

/**
 * Returns true when the call is allowed. `key` should combine the rule name
 * with what is being limited (an IP, an email, a user id).
 */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { stamps: [] };
  bucket.stamps = bucket.stamps.filter((t) => now - t < windowMs);

  if (bucket.stamps.length >= max) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.stamps.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so dead keys do not accumulate forever.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.stamps.length === 0 || now - v.stamps[v.stamps.length - 1] > windowMs) {
        buckets.delete(k);
      }
    }
  }
  return true;
}

/** Best-effort caller IP — Railway's edge sets x-forwarded-for. */
export async function callerIp(): Promise<string> {
  const head = await headers();
  return head.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Rules in one place, so the numbers are easy to reason about together. */
export const LIMITS = {
  /** Passwords are 8+ chars; 10 tries per 15 min per IP+identifier makes
      online guessing useless without being felt by a fumbling student. */
  login: { max: 10, windowMs: 15 * 60_000 },
  /** Account creation from one address: enough for a school computer lab,
      too slow for a spam script. */
  signup: { max: 8, windowMs: 60 * 60_000 },
  /** Reset requests per address+IP — keeps a stranger from bombing a
      victim's inbox once real email is on. */
  forgot: { max: 4, windowMs: 60 * 60_000 },
  /** Completing a reset (submitting a new password) — bounds token guessing
      and breach-API calls from the reset page. */
  reset: { max: 10, windowMs: 15 * 60_000 },
  /** Starting a payment — stops a script spamming Paystack init and filling
      the payments table with pending rows. */
  payment: { max: 12, windowMs: 60 * 60_000 },
  /** Re-sending a verification email — a few resends per hour is plenty. */
  verify: { max: 5, windowMs: 60 * 60_000 },
  /** Chat: quick conversation is fine, scripted flooding is not. */
  message: { max: 20, windowMs: 60_000 },
} as const;
