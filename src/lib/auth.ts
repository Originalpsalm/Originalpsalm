import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { db } from "./db";
import type { User } from "./types";

export const SESSION_COOKIE = "guru_session";
export const DEVICE_COOKIE = "guru_device";
const SESSION_DAYS = 30;

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set to a random string of 32+ characters.");
    }
    // Dev fallback so a fresh clone runs without any setup.
    return new TextEncoder().encode("guru-development-only-secret-do-not-ship-anywhere");
  }
  return new TextEncoder().encode(value);
}

// ---------------------------------------------------------------- passwords

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

// ------------------------------------------------------------------ devices

/** Turns a raw user-agent into something a student will recognise. */
export function deviceLabel(userAgent: string | null): string {
  const ua = userAgent ?? "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iPhone/iPad"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "Mac"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown device";
  return `${browser} on ${os}`;
}

/**
 * Reads the long-lived device cookie, minting one if this browser has never
 * been here. The id is opaque and per-browser, which is what lets us tell
 * "same student, second visit" apart from "friend borrowing the login".
 */
export async function getOrCreateDeviceId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const fresh = crypto.randomUUID();
  jar.set(DEVICE_COOKIE, fresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return fresh;
}

// ----------------------------------------------------------------- sessions

export const MAX_CONCURRENT_SESSIONS = Number(process.env.MAX_CONCURRENT_SESSIONS ?? 1);
export const MAX_DEVICES_PER_WINDOW = Number(process.env.MAX_DEVICES_PER_WINDOW ?? 3);
export const DEVICE_WINDOW_DAYS = Number(process.env.DEVICE_WINDOW_DAYS ?? 30);

export type ActiveSession = {
  id: string;
  device_label: string;
  ip: string | null;
  created_at: string;
  last_seen_at: string;
};

export function activeSessions(userId: number): ActiveSession[] {
  return db
    .prepare(
      `SELECT id, device_label, ip, created_at, last_seen_at
         FROM sessions
        WHERE user_id = ? AND revoked_at IS NULL
        ORDER BY last_seen_at DESC`,
    )
    .all(userId) as ActiveSession[];
}

/** Distinct devices this account has used inside the rolling window. */
export function devicesInWindow(userId: number): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM known_devices
        WHERE user_id = ? AND last_seen >= datetime('now', ?)`,
    )
    .get(userId, `-${DEVICE_WINDOW_DAYS} days`) as { n: number };
  return row.n;
}

export function revokeSession(sessionId: string, by: string) {
  db.prepare(
    `UPDATE sessions SET revoked_at = datetime('now'), revoked_by = ?
      WHERE id = ? AND revoked_at IS NULL`,
  ).run(by, sessionId);
}

export function revokeAllSessions(userId: number, by: string, except?: string) {
  db.prepare(
    `UPDATE sessions SET revoked_at = datetime('now'), revoked_by = ?
      WHERE user_id = ? AND revoked_at IS NULL AND id != COALESCE(?, '')`,
  ).run(by, userId, except ?? null);
}

/**
 * Creates the signed-in session and writes the cookie.
 *
 * `force` is what the "sign me out everywhere else" button sends: without it,
 * a second concurrent login is refused rather than silently kicking whoever
 * was already there.
 */
export async function startSession(
  userId: number,
  opts: { force?: boolean } = {},
): Promise<{ ok: true } | { ok: false; reason: "concurrent"; sessions: ActiveSession[] }> {
  const deviceId = await getOrCreateDeviceId();
  const head = await headers();
  const label = deviceLabel(head.get("user-agent"));
  const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // A device that is already signed in just refreshes — logging in twice on
  // your own phone should never count against you.
  const sameDevice = db
    .prepare(
      `SELECT id FROM sessions
        WHERE user_id = ? AND device_id = ? AND revoked_at IS NULL`,
    )
    .all(userId, deviceId) as { id: string }[];
  for (const s of sameDevice) revokeSession(s.id, "same-device");

  const others = activeSessions(userId);
  if (others.length >= MAX_CONCURRENT_SESSIONS && !opts.force) {
    return { ok: false, reason: "concurrent", sessions: others };
  }
  if (opts.force) revokeAllSessions(userId, "new-login");

  db.prepare(
    `INSERT INTO known_devices (user_id, device_id, label)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, device_id)
     DO UPDATE SET last_seen = datetime('now'), label = excluded.label`,
  ).run(userId, deviceId, label);

  // Too many different devices in one month is the real sharing signal —
  // one person does not study on six phones.
  if (devicesInWindow(userId) > MAX_DEVICES_PER_WINDOW) {
    db.prepare(
      `UPDATE users
          SET locked_until = datetime('now', '+24 hours'),
              lock_reason  = 'Too many devices used on this account.'
        WHERE id = ?`,
    ).run(userId);
  }

  const sessionId = crypto.randomUUID();
  db.prepare(
    `INSERT INTO sessions (id, user_id, device_id, device_label, ip)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(sessionId, userId, deviceId, label, ip);

  const token = await new SignJWT({ uid: userId, sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });

  return { ok: true };
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      revokeSession(String(payload.sid), "user");
    } catch {
      /* expired or tampered — nothing to revoke */
    }
  }
  jar.delete(SESSION_COOKIE);
}

// -------------------------------------------------------------- current user

export type CurrentUser = User & { sessionId: string };

/** Returns the signed-in user, or null. Safe to call from any server code. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let uid: number;
  let sid: string;
  try {
    const { payload } = await jwtVerify(token, secret());
    uid = Number(payload.uid);
    sid = String(payload.sid);
  } catch {
    return null;
  }

  const session = db
    .prepare(`SELECT id FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL`)
    .get(sid, uid) as { id: string } | undefined;
  if (!session) return null; // signed out from another device

  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(uid) as User | undefined;
  if (!user) return null;

  db.prepare(`UPDATE sessions SET last_seen_at = datetime('now') WHERE id = ?`).run(sid);

  return { ...user, sessionId: sid };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// ------------------------------------------------------------ subscriptions

export function isPremium(user: Pick<User, "plan" | "plan_expires_at">): boolean {
  if (user.plan !== "premium") return false;
  if (!user.plan_expires_at) return false;
  return new Date(user.plan_expires_at.replace(" ", "T") + "Z").getTime() > Date.now();
}
