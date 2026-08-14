"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { sendTestEmailAction, type EmailTestState } from "@/actions/email-test";
import { Alert, Button } from "@/components/ui";

/**
 * A one-click "does email actually work?" check for the admin. It sends a real
 * message to the admin's own address and shows the exact result — including the
 * raw Resend error when it fails, which is what actually diagnoses a misconfig.
 */
export function EmailTester({ from }: { from: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<EmailTestState | null>(null);

  function run() {
    startTransition(async () => setState(await sendTestEmailAction()));
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">Test email delivery</h2>
          <p className="mt-0.5 text-xs text-mist">
            Sends a real message to your own admin email. Currently sending as{" "}
            <code className="text-chalk">{from}</code>.
          </p>
        </div>
        <Button size="sm" onClick={run} disabled={pending}>
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {pending ? "Sending…" : "Send test email"}
        </Button>
      </div>

      {state && (
        <div className="mt-4 space-y-2">
          <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>
          {!state.ok && (
            <p className="text-xs leading-relaxed text-mist">
              Common causes: <strong>EMAIL_FROM</strong> points at a domain you haven&apos;t verified
              in Resend (use <code>GURU &lt;onboarding@resend.dev&gt;</code> until your domain is
              verified), or you&apos;re sending to an address other than your own Resend account
              email while still on the shared sender.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
