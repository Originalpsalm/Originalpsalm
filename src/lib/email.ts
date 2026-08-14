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

/** Sends one email. Returns true on success, false on any failure. */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

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
    return res.ok;
  } catch (error) {
    console.error("[email] send failed:", error);
    return false;
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
