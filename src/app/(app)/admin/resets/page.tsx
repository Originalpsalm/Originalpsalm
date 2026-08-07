import { Check, Copy, KeyRound } from "lucide-react";
import { headers } from "next/headers";
import { hasEmailService, pendingResets } from "@/lib/passwords";
import { markResetDeliveredAction } from "@/actions/password";
import { Alert, Badge, Button } from "@/components/ui";
import { CopyLink } from "./CopyLink";

export const metadata = { title: "Password resets" };

export default async function AdminResetsPage() {
  const head = await headers();
  const proto = head.get("x-forwarded-proto") ?? "https";
  const host = head.get("host") ?? "localhost:3000";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  const emailReady = hasEmailService();
  const rows = pendingResets();

  return (
    <div className="space-y-4">
      {emailReady ? (
        <Alert tone="success">
          Email delivery is on — reset links are sent to students automatically. This page will
          usually be empty.
        </Alert>
      ) : (
        <Alert tone="info">
          No email service is configured, so reset links are held here. Copy each link and send it
          to the student directly (WhatsApp, email, SMS), then mark it delivered. To turn on
          automatic delivery, add a <code>RESEND_API_KEY</code> in Railway.
        </Alert>
      )}

      {rows.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          <KeyRound size={22} className="mx-auto mb-2 text-mist" />
          No pending resets.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((entry) => {
            const link = `${appUrl.replace(/\/$/, "")}/reset-password?token=${entry.token}`;
            return (
              <li key={entry.token} className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{entry.name}</p>
                    <p className="truncate text-xs text-mist">{entry.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="mist">
                      requested {entry.created_at.slice(0, 16)}
                    </Badge>
                    <Badge tone="gold">
                      expires {entry.expires_at.slice(11, 16)} UTC
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CopyLink link={link} />
                  <form action={markResetDeliveredAction}>
                    <input type="hidden" name="token" value={entry.token} />
                    <Button size="sm" variant="ghost">
                      <Check size={13} /> Mark delivered
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
