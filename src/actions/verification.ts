"use server";

import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { startEmailVerification } from "@/lib/verification";
import { hasEmailService } from "@/lib/email";
import { LIMITS, allow } from "@/lib/rate-limit";

export type VerifyState = { error?: string; success?: string };

/** Re-sends the confirmation email to the signed-in user's own address. */
export async function resendVerificationAction(): Promise<VerifyState> {
  const user = await requireUser();

  if (!hasEmailService()) {
    return { error: "Email is not switched on yet. Please try again later." };
  }
  if (user.email_verified === 1) {
    return { success: "Your email is already verified." };
  }
  if (!allow(`verify:${user.id}`, LIMITS.verify.max, LIMITS.verify.windowMs)) {
    return { error: "You've asked a few times already. Please wait a little before retrying." };
  }

  const head = await headers();
  const proto = head.get("x-forwarded-proto") ?? "https";
  const host = head.get("host") ?? "localhost:3000";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  await startEmailVerification({ id: user.id, email: user.email, name: user.name }, appUrl);
  return { success: `We've sent a fresh link to ${user.email}. Check your inbox and spam folder.` };
}
