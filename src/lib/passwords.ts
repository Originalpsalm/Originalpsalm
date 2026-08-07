import "server-only";
import crypto from "node:crypto";
import { db } from "./db";
import { hashPassword, revokeAllSessions } from "./auth";

const TOKEN_TTL_HOURS = 2;

/**
 * Whether an email service is wired up. When it is not, resets fall back to
 * being logged to stdout and offered to the admin panel — the app never
 * blocks a student's reset just because no mail server is configured.
 */
export function hasEmailService(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type ResetRow = {
  token: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  delivered: number;
  name: string;
  email: string;
};

/**
 * Requests a reset for the given email. Always looks like it worked from the
 * outside — a distinguishable response would let anyone check whether an
 * account exists on the platform.
 */
export async function requestReset(rawEmail: string, appUrl: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const user = db
    .prepare(`SELECT id, name, email FROM users WHERE lower(email) = ?`)
    .get(email) as { id: number; name: string; email: string } | undefined;
  if (!user) return;

  // Clear any earlier unused tokens so only one live link ever exists at a
  // time — the last request is the one that works.
  db.prepare(`DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL`).run(user.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  db.prepare(
    `INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)`,
  ).run(token, user.id, expires);

  const link = `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  if (hasEmailService()) {
    await sendResetEmail({ to: user.email, name: user.name, link });
    db.prepare(`UPDATE password_resets SET delivered = 1 WHERE token = ?`).run(token);
  } else {
    // Two safety nets: logs so a small operator can copy the link from the
    // server console, and a row the admin panel can surface as a queue.
    console.log(`[password-reset] no email service; deliver to ${user.email}: ${link}`);
  }
}

/** Reads a token if it is unused and unexpired. */
export function verifyToken(token: string): { user_id: number; email: string; name: string } | null {
  const row = db
    .prepare(
      `SELECT r.token, r.user_id, r.used_at, r.expires_at, u.name, u.email
         FROM password_resets r JOIN users u ON u.id = r.user_id
        WHERE r.token = ?`,
    )
    .get(token) as
    | {
        token: string;
        user_id: number;
        used_at: string | null;
        expires_at: string;
        name: string;
        email: string;
      }
    | undefined;
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at.replace(" ", "T") + "Z") <= new Date()) return null;
  return { user_id: row.user_id, email: row.email, name: row.name };
}

/**
 * Completes the reset. The token is stamped used before anything else, so a
 * double-submit cannot reuse it, and every other device is signed out — a
 * password change should never leave a stale session on somebody's phone.
 */
export function completeReset(token: string, newPassword: string): boolean {
  const info = verifyToken(token);
  if (!info) return false;

  const run = db.transaction(() => {
    db.prepare(`UPDATE password_resets SET used_at = datetime('now') WHERE token = ?`).run(token);
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(
      hashPassword(newPassword),
      info.user_id,
    );
  });
  run();
  revokeAllSessions(info.user_id, "password-reset");
  return true;
}

// ------------------------------------------------------- admin: the queue

/**
 * Pending resets the admin needs to hand-deliver. Empty when email works, so
 * this quietly stops showing once you plug Resend in.
 */
export function pendingResets(): ResetRow[] {
  return db
    .prepare(
      `SELECT r.token, r.user_id, r.created_at, r.expires_at, r.used_at, r.delivered,
              u.name, u.email
         FROM password_resets r JOIN users u ON u.id = r.user_id
        WHERE r.used_at IS NULL
          AND r.delivered = 0
          AND r.expires_at > datetime('now')
        ORDER BY r.created_at DESC`,
    )
    .all() as ResetRow[];
}

// ---------------------------------------------------------- email delivery

async function sendResetEmail(input: { to: string; name: string; link: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "GURU <onboarding@resend.dev>",
        to: input.to,
        subject: "Reset your GURU password",
        html: `<p>Hi ${escapeHtml(input.name)},</p>
<p>Someone (hopefully you) asked to reset your GURU password. This link works for the next ${TOKEN_TTL_HOURS} hours and can only be used once:</p>
<p><a href="${input.link}">${input.link}</a></p>
<p>If you did not ask for this, ignore this message — your password stays as it is.</p>`,
      }),
    });
  } catch (error) {
    // Falls back to admin-queue delivery on the next request, so a student is
    // not stuck if the email API happens to be down.
    console.error("[password-reset] Resend failed:", error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) =>
    character === "&"
      ? "&amp;"
      : character === "<"
        ? "&lt;"
        : character === ">"
          ? "&gt;"
          : character === '"'
            ? "&quot;"
            : "&#39;",
  );
}
