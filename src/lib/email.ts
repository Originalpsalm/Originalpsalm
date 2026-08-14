import "server-only";

/**
 * A single place for transactional email. Uses Resend when RESEND_API_KEY is
 * set; otherwise every feature that sends mail is expected to degrade
 * gracefully (password resets fall back to the admin queue; email verification
 * simply stays off). No mail server is ever required to run the app.
 */

export function hasEmailService(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "GURU <onboarding@resend.dev>";
}

export type SendResult = { ok: boolean; error?: string };

/**
 * Sends one email. Returns { ok } and, on failure, a human-readable `error`
 * carrying the exact reason Resend gave (bad key, unverified domain, recipient
 * not allowed on the shared sender, …) so problems can be diagnosed instead of
 * silently swallowed.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "No email service configured (RESEND_API_KEY is unset)." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
      cache: "no-store",
    });

    if (res.ok) return { ok: true };

    // Surface Resend's own message — this is where "domain not verified" or
    // "you can only send to your own address" actually shows up.
    const detail = await res.text().catch(() => "");
    let message = `Resend returned ${res.status}`;
    try {
      const parsed = JSON.parse(detail) as { message?: string; name?: string };
      if (parsed.message) message = `${message}: ${parsed.message}`;
    } catch {
      if (detail) message = `${message}: ${detail.slice(0, 300)}`;
    }
    console.error("[email] send failed:", message);
    return { ok: false, error: message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "network error";
    console.error("[email] send failed:", message);
    return { ok: false, error: `Could not reach Resend: ${message}` };
  }
}

export function escapeHtml(value: string): string {
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
