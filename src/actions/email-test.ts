"use server";

import { requireAdmin } from "@/lib/auth";
import { emailFrom, hasEmailService, sendEmail } from "@/lib/email";

export type EmailTestState = {
  ok?: boolean;
  message?: string;
  from?: string;
  to?: string;
};

/**
 * Sends a real test email to the signed-in admin's own address and reports the
 * exact result — the fastest way to tell whether Resend is configured
 * correctly and, if not, why (bad key, unverified domain, recipient not
 * allowed on the shared sender).
 */
export async function sendTestEmailAction(): Promise<EmailTestState> {
  const admin = await requireAdmin();

  if (!hasEmailService()) {
    return {
      ok: false,
      message: "No email service is configured yet. Add RESEND_API_KEY in Railway and redeploy.",
    };
  }

  const result = await sendEmail({
    to: admin.email,
    subject: "GURU email test",
    html: `<p>Hi ${admin.name},</p><p>This is a test email from your GURU admin panel. If you can read this, email delivery is working.</p>`,
  });

  return {
    ok: result.ok,
    from: emailFrom(),
    to: admin.email,
    message: result.ok
      ? `Sent. Check the inbox for ${admin.email} (and the spam folder).`
      : result.error ?? "Sending failed for an unknown reason.",
  };
}
