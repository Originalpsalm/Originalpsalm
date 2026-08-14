import "server-only";
import crypto from "node:crypto";
import { db } from "./db";
import { escapeHtml, hasEmailService, sendEmail } from "./email";
import type { User } from "./types";

const TOKEN_TTL_HOURS = 48;

/**
 * Whether this user should be nudged (and gated) to verify their email. Only
 * true when an email service is actually configured — with no way to send the
 * link, we never ask a student to do the impossible.
 */
export function needsVerification(user: Pick<User, "email_verified">): boolean {
  return hasEmailService() && user.email_verified !== 1;
}

/**
 * Issues a fresh verification link and emails it. Best-effort: if no email
 * service is configured it does nothing, and a send failure is swallowed so
 * signup itself never fails on it (the user can trigger a resend later).
 */
export async function startEmailVerification(
  user: { id: number; email: string; name: string },
  appUrl: string,
): Promise<void> {
  if (!hasEmailService()) return;

  db.prepare(`DELETE FROM email_verifications WHERE user_id = ?`).run(user.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 3600 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  db.prepare(
    `INSERT INTO email_verifications (token, user_id, expires_at) VALUES (?, ?, ?)`,
  ).run(token, user.id, expires);

  const link = `${appUrl.replace(/\/$/, "")}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Confirm your GURU email",
    html: `<p>Hi ${escapeHtml(user.name)},</p>
<p>Welcome to GURU! Please confirm this is your email address by clicking the link below. It works for the next ${TOKEN_TTL_HOURS} hours:</p>
<p><a href="${link}">${link}</a></p>
<p>If you did not create a GURU account, you can safely ignore this message.</p>`,
  });
}

/**
 * Consumes a token and marks the account verified. Returns the user id on
 * success, or null if the token is unknown or expired. Idempotent enough that
 * a second click just reports success.
 */
export function confirmEmail(token: string): { user_id: number } | null {
  const row = db
    .prepare(`SELECT token, user_id, expires_at FROM email_verifications WHERE token = ?`)
    .get(token) as { token: string; user_id: number; expires_at: string } | undefined;
  if (!row) return null;
  if (new Date(row.expires_at.replace(" ", "T") + "Z") <= new Date()) {
    db.prepare(`DELETE FROM email_verifications WHERE token = ?`).run(token);
    return null;
  }

  const run = db.transaction(() => {
    db.prepare(`UPDATE users SET email_verified = 1 WHERE id = ?`).run(row.user_id);
    db.prepare(`DELETE FROM email_verifications WHERE user_id = ?`).run(row.user_id);
  });
  run();
  return { user_id: row.user_id };
}
