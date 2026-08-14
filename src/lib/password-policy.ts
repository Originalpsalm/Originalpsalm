import "server-only";
import crypto from "node:crypto";

/**
 * Password strength and breach checks, kept in one place so signup, password
 * change and reset all enforce the same rules.
 *
 * The philosophy: block the passwords that actually get accounts taken over —
 * short ones, the handful everybody tries first, and anything already known to
 * be in a public breach — without frustrating a student who picks a normal
 * memorable password.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200; // stops absurd inputs; bcrypt only reads 72 bytes anyway

// The passwords that show up at the top of every breach corpus. A short,
// high-value list — not a dictionary — so we reject the obvious guesses a
// brute-force script tries first without pretending to be a full filter.
const COMMON = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789",
  "1234567890", "qwerty", "qwertyuiop", "abc12345", "111111", "000000",
  "iloveyou", "letmein", "welcome", "admin", "adminadmin", "football",
  "monkey", "dragon", "sunshine", "princess", "changeme", "trustno1",
  "guru1234", "student", "nigeria", "naija123", "waec2024", "jamb2024",
]);

export type StrengthResult = { ok: true } | { ok: false; error: string };

/**
 * Synchronous rule checks — no network. Pass any identifiers the user just
 * typed (name/username/email) so we can reject a password that is basically
 * their own name.
 */
export function checkStrength(
  password: string,
  identifiers: (string | null | undefined)[] = [],
): StrengthResult {
  if (password.length < PASSWORD_MIN) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
  }
  if (password.length > PASSWORD_MAX) {
    return { ok: false, error: "That password is too long." };
  }

  const lower = password.toLowerCase();

  if (COMMON.has(lower)) {
    return { ok: false, error: "That password is too common — pick something harder to guess." };
  }

  // All one repeated character, or a simple run like 12345678 / abcdefgh.
  if (/^(.)\1+$/.test(password)) {
    return { ok: false, error: "Don't use the same character repeated — pick something stronger." };
  }
  if (isSequential(lower)) {
    return { ok: false, error: "Avoid simple sequences like 12345678 — pick something stronger." };
  }

  // Not (almost) equal to the user's own name / username / email local part.
  for (const raw of identifiers) {
    const id = (raw ?? "").trim().toLowerCase();
    const local = id.includes("@") ? id.split("@")[0] : id;
    if (local.length >= 3 && (lower === local || lower.includes(local) || local.includes(lower))) {
      return { ok: false, error: "Password is too close to your name or email — choose another." };
    }
  }

  return { ok: true };
}

function isSequential(value: string): boolean {
  if (value.length < 6) return false;
  const seqs = "0123456789abcdefghijklmnopqrstuvwxyz";
  const rev = [...seqs].reverse().join("");
  return seqs.includes(value) || rev.includes(value);
}

/**
 * HaveIBeenPwned "range" check using k-anonymity: only the first 5 characters
 * of the SHA-1 hash ever leave the server — the password itself never does.
 * Returns how many breaches the password appears in, or null when the check
 * could not run (network blocked, timeout). Callers treat null as "unknown"
 * and fall back to the local rules only, so a breach-API outage never blocks a
 * legitimate signup.
 */
export async function breachCount(password: string): Promise<number | null> {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    if (!res.ok) return null;
    const body = await res.text();
    for (const line of body.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return Number(count) || 0;
    }
    return 0;
  } catch {
    return null; // fail open — local rules still applied
  }
}

/**
 * The full gate used by the actions: synchronous rules first (cheap, always
 * run), then the breach check if the rules passed. `error` is user-facing.
 */
export async function validatePassword(
  password: string,
  identifiers: (string | null | undefined)[] = [],
): Promise<StrengthResult> {
  const strength = checkStrength(password, identifiers);
  if (!strength.ok) return strength;

  const breaches = await breachCount(password);
  if (breaches !== null && breaches > 0) {
    return {
      ok: false,
      error:
        "This password has appeared in a known data breach. Please choose one you haven't used elsewhere.",
    };
  }
  return { ok: true };
}
