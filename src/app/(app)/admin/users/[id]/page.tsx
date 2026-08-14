import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  LogOut,
  MonitorSmartphone,
  Smartphone,
  Unlock,
} from "lucide-react";
import { isAdmin, isOwner, isPremium, requireAdmin } from "@/lib/auth";
import { adminUserById, userDossier } from "@/lib/admin";
import {
  grantPremiumAction,
  revokePremiumAction,
  signOutEverywhereAction,
  unlockAccountAction,
} from "@/actions/admin";
import { Alert, Avatar, Badge, Button, inputClass, naira } from "@/components/ui";
import { DangerZone } from "./DangerZone";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminUserPage({ params, searchParams }: Props) {
  const actor = await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const user = adminUserById(Number(id));
  if (!user) notFound();

  const dossier = userDossier(user.id);
  const premium = isPremium(user);
  const locked =
    user.locked_until !== null &&
    new Date(user.locked_until.replace(" ", "T") + "Z") > new Date();

  const isSelf = user.id === actor.id;
  // Admins can act on students only; the founder can also act on admins.
  const canAct = !isSelf && !isOwner(user) && (!isAdmin(user) || isOwner(actor));
  const liveSessions = dossier.sessions.filter((s) => s.revoked_at === null);

  return (
    <div className="space-y-5">
      <Link
        href="/admin/users"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> All students
      </Link>

      {error === "confirm" && (
        <Alert>The username you typed did not match, so nothing was deleted.</Alert>
      )}

      {/* --------------------------------------------------------- identity */}
      <header className="card flex flex-wrap items-center gap-4 p-5">
        <Avatar name={user.name} hue={user.avatar_hue} userId={user.id} avatarVersion={user.avatar_version} size={56} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-extrabold tracking-tight">{user.name}</h2>
          <p className="truncate text-sm text-mist">
            @{user.username} · {user.email}
          </p>
          <p className="truncate text-xs text-mist/70">
            {[user.class_level, user.school, user.state].filter(Boolean).join(" · ") || "No school details"}
            {" · joined "}
            {user.created_at.slice(0, 10)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role !== "student" && (
            <Badge tone={user.role === "owner" ? "gold" : "leaf"}>{user.role}</Badge>
          )}
          {premium ? (
            <Badge tone="gold">
              <Crown size={11} /> Premium
            </Badge>
          ) : (
            <Badge tone="mist">Free</Badge>
          )}
          {locked && <Badge tone="red">Locked</Badge>}
        </div>
      </header>

      {isSelf && (
        <Alert tone="info">
          This is your own account. To avoid locking yourself out, actions are disabled here.
        </Alert>
      )}
      {!isSelf && !canAct && (
        <Alert tone="info">
          {isOwner(user)
            ? "This is the founder account and cannot be modified from here."
            : "This is another administrator. Only the founder can act on staff accounts."}
        </Alert>
      )}

      {/* ------------------------------------------------- the lockout desk */}
      {locked && (
        <section className="card border-red-500/30 p-5">
          <h3 className="font-bold text-red-300">Account is locked</h3>
          <p className="mt-1 text-sm text-mist">
            {user.lock_reason ?? "No reason recorded."} Access returns on{" "}
            <span className="text-chalk">{user.locked_until?.slice(0, 16)} UTC</span>.
          </p>
          <p className="mt-2 text-xs text-mist/80">
            Before unlocking, look at the device list below. Several different phones in a few days
            is sharing; one new phone after a long gap is a student who changed handset.
          </p>
          {canAct && (
            <form action={unlockAccountAction} className="mt-4">
              <input type="hidden" name="userId" value={user.id} />
              <Button size="sm">
                <Unlock size={15} /> Unlock and reset device history
              </Button>
            </form>
          )}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------------------------------------- subscription */}
        <section className="card p-5">
          <h3 className="font-bold">Subscription</h3>
          <p className="mt-1 text-sm text-mist">
            {premium
              ? `Premium until ${user.plan_expires_at?.slice(0, 10)}`
              : "On the free plan."}
          </p>

          {canAct && (
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <form action={grantPremiumAction} className="flex items-end gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <label className="text-xs text-mist">
                  Months
                  <input
                    name="months"
                    type="number"
                    min={1}
                    max={24}
                    defaultValue={1}
                    className={inputClass + " mt-1 w-20 px-3 py-1.5 text-sm"}
                  />
                </label>
                <Button size="sm" variant="gold">
                  <Crown size={14} /> Give premium
                </Button>
              </form>

              {premium && (
                <form action={revokePremiumAction}>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button size="sm" variant="ghost">
                    Remove premium
                  </Button>
                </form>
              )}
            </div>
          )}

          <p className="mt-3 text-xs text-mist/70">
            Granted months stack on top of any days already remaining.
          </p>
        </section>

        {/* ------------------------------------------------------ payments */}
        <section className="card p-5">
          <h3 className="font-bold">Payments</h3>
          {dossier.payments.length === 0 ? (
            <p className="mt-2 text-sm text-mist">No payments yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {dossier.payments.map((payment) => (
                <li key={payment.id} className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    {naira(payment.amount_kobo / 100)}
                  </span>
                  <span className="truncate font-mono text-xs text-mist">{payment.reference}</span>
                  <Badge
                    tone={
                      payment.status === "success" ? "leaf" : payment.status === "failed" ? "red" : "mist"
                    }
                    className="ml-auto"
                  >
                    {payment.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* --------------------------------------------------------- devices */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-bold">Devices and sign-ins</h3>
          <Badge tone={dossier.devices.length > 3 ? "red" : "mist"}>
            <Smartphone size={11} /> {dossier.devices.length} device
            {dossier.devices.length === 1 ? "" : "s"} ever
          </Badge>
          <Badge tone="mist">{liveSessions.length} signed in now</Badge>

          {canAct && liveSessions.length > 0 && (
            <form action={signOutEverywhereAction} className="ml-auto">
              <input type="hidden" name="userId" value={user.id} />
              <Button size="sm" variant="ghost">
                <LogOut size={14} /> Sign out everywhere
              </Button>
            </form>
          )}
        </div>

        {dossier.devices.length > 0 && (
          <ul className="mt-4 space-y-2">
            {dossier.devices.map((device) => (
              <li
                key={device.device_id}
                className="surface flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm"
              >
                <MonitorSmartphone size={16} className="shrink-0 text-mist" />
                <span className="font-medium">{device.label}</span>
                <span className="ml-auto text-xs text-mist tabular-nums">
                  first {device.first_seen.slice(0, 10)} · last {device.last_seen.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {dossier.sessions.length > 0 && (
          <details className="mt-4">
            <summary className="focus-ring cursor-pointer text-sm text-mist hover:text-chalk">
              Recent sign-in history
            </summary>
            <ul className="mt-3 space-y-1.5 text-xs">
              {dossier.sessions.map((session) => (
                <li key={session.id} className="flex flex-wrap gap-2 text-mist">
                  <span className="text-chalk">{session.device_label}</span>
                  <span>{session.created_at.slice(0, 16)}</span>
                  {session.ip && <span className="font-mono">{session.ip}</span>}
                  <span className="ml-auto">
                    {session.revoked_at
                      ? `ended (${session.revoked_by})`
                      : "active"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* -------------------------------------------------------- activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-bold">Recent papers</h3>
          {dossier.attempts.length === 0 ? (
            <p className="mt-2 text-sm text-mist">Has not attempted a paper yet.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {dossier.attempts.map((attempt) => (
                <li key={attempt.id} className="flex gap-3">
                  <span className="min-w-0 flex-1 truncate">
                    {attempt.subject}{" "}
                    <span className="text-mist">
                      · {attempt.exam_body} {attempt.year}
                    </span>
                  </span>
                  <span className="tabular-nums text-mist">
                    {attempt.score}/{attempt.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h3 className="font-bold">Study groups</h3>
          {dossier.groups.length === 0 ? (
            <p className="mt-2 text-sm text-mist">Not in any group.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {dossier.groups.map((group) => (
                <li key={group.id} className="flex gap-3">
                  <Link href={`/groups/${group.id}`} className="focus-ring truncate rounded hover:text-leaf-400">
                    {group.name}
                  </Link>
                  {group.role === "owner" && <Badge tone="mist">owner</Badge>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {canAct && (
        <DangerZone
          userId={user.id}
          username={user.username}
          role={user.role}
          locked={locked}
          canSetRole={isOwner(actor)}
        />
      )}
    </div>
  );
}
