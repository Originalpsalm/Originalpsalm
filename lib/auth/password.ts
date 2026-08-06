import { hash, verify } from "@node-rs/argon2";

/**
 * Password hashing with argon2id (ADR-0002).
 *
 * Parameters follow OWASP's current recommendation: 19 MiB memory, 2
 * iterations, parallelism 1 — tuned to be expensive for GPU attackers while
 * staying well inside a request budget.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashed, plain, ARGON2_OPTIONS);
  } catch {
    // A malformed or truncated hash must read as "wrong password", never as an
    // unhandled error that would distinguish this case to a caller.
    return false;
  }
}
