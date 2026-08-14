"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { completeReset, hasEmailService, requestReset, verifyToken } from "@/lib/passwords";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordAction } from "@/lib/admin";
import { LIMITS, allow, callerIp } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-policy";

export type ForgotState = { error?: string; success?: boolean };

const forgotSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address."),
});

/** Deliberately says the same thing whether the address exists or not. */
export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = forgotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Limited per IP + address so nobody can bomb a victim's inbox. The reply
  // still claims success — a "slow down" here would itself confirm that the
  // address is registered.
  const email = parsed.data.email.trim().toLowerCase();
  if (!allow(`forgot:${await callerIp()}:${email}`, LIMITS.forgot.max, LIMITS.forgot.windowMs)) {
    return { success: true };
  }

  const head = await headers();
  const proto = head.get("x-forwarded-proto") ?? "https";
  const host = head.get("host") ?? "localhost:3000";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  await requestReset(email, appUrl);
  return { success: true };
}

export type ResetState = { error?: string };

const resetSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Throttle by IP so the reset endpoint can't be hammered to guess tokens or
  // to burn through the breach-check API.
  if (!allow(`reset:${await callerIp()}`, LIMITS.reset.max, LIMITS.reset.windowMs)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  // Enforce the same strength/breach rules as signup. The token identifies the
  // account, so we can also reject a password that echoes the user's own name.
  const owner = verifyToken(parsed.data.token);
  if (!owner) return { error: "That reset link is no longer valid. Request a new one." };

  const strong = await validatePassword(parsed.data.password, [owner.name, owner.email]);
  if (!strong.ok) return { error: strong.error };

  const ok = completeReset(parsed.data.token, parsed.data.password);
  if (!ok) return { error: "That reset link is no longer valid. Request a new one." };

  redirect("/login?reset=1");
}

/**
 * Admin-side: mark a queued reset as delivered so it disappears from the
 * "hand-deliver" list without waiting for expiry. Used after the admin has
 * copied the link and sent it to the student themselves.
 */
export async function markResetDeliveredAction(formData: FormData) {
  const actor = await requireAdmin();
  const token = String(formData.get("token") ?? "");
  const row = db
    .prepare(
      `SELECT r.token, u.email FROM password_resets r JOIN users u ON u.id = r.user_id
        WHERE r.token = ? AND r.used_at IS NULL`,
    )
    .get(token) as { token: string; email: string } | undefined;
  if (!row) redirect("/admin/resets");

  db.prepare(`UPDATE password_resets SET delivered = 1 WHERE token = ?`).run(row.token);
  recordAction({
    actorId: actor.id,
    action: "reset.delivered",
    targetType: "user",
    targetLabel: row.email,
  });
  redirect("/admin/resets");
}

export async function resetEmailAvailableAction(): Promise<boolean> {
  return hasEmailService();
}
