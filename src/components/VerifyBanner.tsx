"use client";

import { useState, useTransition } from "react";
import { Loader2, MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/actions/verification";
import { cn } from "./ui";

/**
 * A gentle, always-visible nudge for users who have not confirmed their email.
 * Shown only when an email service is configured (decided server-side), so it
 * never appears asking for something the app can't deliver.
 */
export function VerifyBanner({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function resend() {
    startTransition(async () => {
      const result = await resendVerificationAction();
      if (result.error) setMessage({ tone: "err", text: result.error });
      else if (result.success) setMessage({ tone: "ok", text: result.success });
    });
  }

  return (
    <div className="mb-5 rounded-xl border border-gold-500/25 bg-gold-500/10 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <MailWarning size={18} className="shrink-0 text-gold-400" />
        <p className="min-w-0 flex-1 text-sm text-chalk">
          Confirm your email{" "}
          <span className="font-semibold">{email}</span> to unlock study groups and secure your
          account.
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className={cn(
            "focus-ring inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-sm font-semibold text-brandink transition hover:bg-gold-400",
            pending && "opacity-70",
          )}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null}
          {pending ? "Sending…" : "Resend email"}
        </button>
      </div>
      {message && (
        <p className={cn("mt-2 text-xs", message.tone === "ok" ? "text-leaf-400" : "text-red-300")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
