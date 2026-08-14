import {
  Crown,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  DEVICE_WINDOW_DAYS,
  MAX_CONCURRENT_SESSIONS,
  MAX_DEVICES_PER_WINDOW,
  activeSessions,
  devicesInWindow,
  isPremium,
  requireUser,
} from "@/lib/auth";
import { logoutAction, revokeOtherSessionsAction, revokeSessionAction } from "@/actions/auth";
import { userStats } from "@/lib/queries";
import { Avatar, Badge, Button, ButtonLink, naira } from "@/components/ui";
import { PREMIUM_PRICE_NAIRA } from "@/lib/billing";
import { ProfileForms } from "./ProfileForms";
import { AvatarUploader } from "./AvatarUploader";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const premium = isPremium(user);
  const sessions = activeSessions(user.id);
  const deviceCount = devicesInWindow(user.id);
  const stats = userStats(user.id);

  const expires = user.plan_expires_at
    ? new Date(user.plan_expires_at.replace(" ", "T") + "Z")
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ------------------------------------------------------- profile --- */}
      <header className="card animate-rise flex flex-wrap items-center gap-4 p-6">
        <Avatar
          name={user.name}
          hue={user.avatar_hue}
          size={64}
          userId={user.id}
          avatarVersion={user.avatar_version}
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold tracking-tight">{user.name}</h1>
          <p className="truncate text-sm text-mist">@{user.username}</p>
          <p className="mt-1 truncate text-xs text-mist/70">{user.email}</p>
        </div>
        {premium ? (
          <Badge tone="gold">
            <Crown size={12} /> Premium
          </Badge>
        ) : (
          <Badge tone="mist">Free plan</Badge>
        )}
      </header>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Papers", value: stats.attempts },
          { label: "Answered", value: stats.answered },
          { label: "Accuracy", value: `${stats.accuracy}%` },
        ].map((item) => (
          <div key={item.label} className="surface p-4 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{item.value}</p>
            <p className="text-xs text-mist">{item.label}</p>
          </div>
        ))}
      </section>

      {/* --------------------------------------------------- subscription --- */}
      <section className="card p-6">
        <h2 className="text-lg font-bold">Subscription</h2>
        {premium && expires ? (
          <>
            <p className="mt-2 text-sm text-mist">
              Premium is active until{" "}
              <span className="font-semibold text-chalk">
                {expires.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              .
            </p>
            <ButtonLink href="/premium" variant="ghost" size="sm" className="mt-4">
              Extend subscription
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-mist">
              You are on the free plan — the first 5 questions of each paper. Premium opens
              everything for {naira(PREMIUM_PRICE_NAIRA)} a month.
            </p>
            <ButtonLink href="/premium" variant="gold" size="sm" className="mt-4">
              <Crown size={14} /> Go Premium
            </ButtonLink>
          </>
        )}
      </section>

      {/* -------------------------------------------------------- devices --- */}
      <section className="card p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-leaf-400" />
          <div>
            <h2 className="text-lg font-bold">Devices and sign-ins</h2>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              Your account allows{" "}
              <span className="font-semibold text-chalk">
                {MAX_CONCURRENT_SESSIONS} device signed in at a time
              </span>{" "}
              and up to {MAX_DEVICES_PER_WINDOW} different devices in {DEVICE_WINDOW_DAYS} days.
              This is what stops logins being passed around — and it is why Premium can cost{" "}
              {naira(PREMIUM_PRICE_NAIRA)} instead of ten times that.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs">
          <Smartphone size={14} className="text-mist" />
          <span className="text-mist">
            {deviceCount} of {MAX_DEVICES_PER_WINDOW} devices used in the last{" "}
            {DEVICE_WINDOW_DAYS} days
          </span>
          <span className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-ink-700">
            <span
              className={
                "block h-full rounded-full " +
                (deviceCount >= MAX_DEVICES_PER_WINDOW ? "bg-red-500" : "brand-gradient")
              }
              style={{
                width: `${Math.min(100, (deviceCount / MAX_DEVICES_PER_WINDOW) * 100)}%`,
              }}
            />
          </span>
        </div>

        <ul className="mt-5 space-y-2">
          {sessions.map((session) => {
            const isCurrent = session.id === user.sessionId;
            return (
              <li
                key={session.id}
                className="surface flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
              >
                <MonitorSmartphone size={17} className="shrink-0 text-mist" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {session.device_label}
                    {isCurrent && <span className="ml-2 text-xs text-leaf-400">this device</span>}
                  </p>
                  <p className="truncate text-xs text-mist">
                    Signed in {session.created_at.slice(0, 16)} UTC
                    {session.ip ? ` · ${session.ip}` : ""}
                  </p>
                </div>
                <form action={revokeSessionAction}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <Button variant="ghost" size="sm">
                    {isCurrent ? "Sign out" : "Remove"}
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>

        {sessions.length > 1 && (
          <form action={revokeOtherSessionsAction} className="mt-3">
            <Button variant="danger" size="sm" className="w-full">
              Sign out everywhere else
            </Button>
          </form>
        )}
      </section>

      {/* ------------------------------------------------- profile picture --- */}
      <AvatarUploader
        userId={user.id}
        name={user.name}
        avatarHue={user.avatar_hue}
        avatarVersion={user.avatar_version}
        hasPhoto={user.avatar_version > 0}
      />

      {/* --------------------------------------------------- profile forms --- */}
      <ProfileForms
        user={{
          name: user.name,
          school: user.school,
          class_level: user.class_level,
          state: user.state,
          phone: user.phone,
        }}
      />

      <form action={logoutAction}>
        <Button variant="ghost" className="w-full">
          <LogOut size={16} /> Sign out
        </Button>
      </form>
    </div>
  );
}
