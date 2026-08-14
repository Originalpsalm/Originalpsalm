import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { VerifyBanner } from "@/components/VerifyBanner";
import { Button } from "@/components/ui";
import { isAdmin, isPremium, requireUser } from "@/lib/auth";
import { needsVerification } from "@/lib/verification";
import { logoutAction } from "@/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const lockedUntil = user.locked_until
    ? new Date(user.locked_until.replace(" ", "T") + "Z")
    : null;

  if (lockedUntil && lockedUntil > new Date()) {
    return (
      <main className="grid min-h-dvh place-items-center px-5">
        <div className="card w-full max-w-md p-8 text-center">
          <Logo size={32} className="mx-auto" />
          <div className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-300">
            <ShieldAlert size={26} />
          </div>
          <h1 className="mt-5 text-xl font-bold">Account temporarily locked</h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            {user.lock_reason ?? "Unusual activity was noticed on this account."} GURU accounts are
            for one student, so we pause an account when it is used across too many devices.
          </p>
          <p className="mt-3 text-sm text-mist">
            Access returns on{" "}
            <span className="font-semibold text-chalk">
              {lockedUntil.toUTCString().slice(0, 22)} UTC
            </span>
            .
          </p>
          <form action={logoutAction} className="mt-6">
            <Button variant="ghost" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        avatar_hue: user.avatar_hue,
        avatar_version: user.avatar_version,
        premium: isPremium(user),
        admin: isAdmin(user),
      }}
    >
      {needsVerification(user) && <VerifyBanner email={user.email} />}
      {children}
    </AppShell>
  );
}
