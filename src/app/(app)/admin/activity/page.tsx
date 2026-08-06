import { listActions } from "@/lib/admin";
import { Avatar, Badge } from "@/components/ui";

/** Human wording for each recorded action, so the log reads as a sentence. */
const PHRASING: Record<string, { text: string; tone: "leaf" | "gold" | "red" | "mist" }> = {
  "premium.grant": { text: "gave premium to", tone: "gold" },
  "premium.revoke": { text: "removed premium from", tone: "mist" },
  "account.unlock": { text: "unlocked", tone: "leaf" },
  "account.signout_all": { text: "signed out all devices for", tone: "mist" },
  "account.suspend": { text: "suspended", tone: "red" },
  "account.delete": { text: "deleted the account of", tone: "red" },
  "role.promote": { text: "made an administrator:", tone: "gold" },
  "role.demote": { text: "removed admin access from", tone: "mist" },
  "group.delete": { text: "deleted the group", tone: "red" },
  "message.delete": { text: "deleted a message by", tone: "red" },
  "payment.approve": { text: "approved a payment:", tone: "gold" },
  "payment.reject": { text: "marked a payment failed:", tone: "mist" },
};

export default function AdminActivityPage() {
  const actions = listActions(150);

  return (
    <div className="space-y-4">
      <p className="text-xs text-mist">
        Every action any administrator takes on an account, group or payment. This is the record
        that answers “who gave that student free premium?” — it cannot be edited from the app.
      </p>

      {actions.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          Nothing has been done yet. Actions appear here as soon as staff start using the panel.
        </p>
      ) : (
        <ul className="space-y-2">
          {actions.map((entry) => {
            const phrase = PHRASING[entry.action] ?? { text: entry.action, tone: "mist" as const };
            return (
              <li key={entry.id} className="card flex flex-wrap items-start gap-3 p-4">
                <Avatar name={entry.actor_name} hue={entry.avatar_hue} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{entry.actor_name}</span>{" "}
                    <span className="text-mist">{phrase.text}</span>{" "}
                    <span className="font-medium">{entry.target_label ?? entry.target_id}</span>
                  </p>
                  {entry.detail && (
                    <p className="mt-0.5 truncate text-xs text-mist">{entry.detail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={phrase.tone}>{entry.target_type}</Badge>
                  <span className="text-xs text-mist tabular-nums">
                    {entry.created_at.slice(0, 16)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
