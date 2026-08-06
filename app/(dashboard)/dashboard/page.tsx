import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth/session";

import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login");
  }

  const user = await getPrisma().user.findFirst({
    where: { id: auth.userId, organizationId: auth.organizationId, deletedAt: null },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { name: true } },
      organization: { select: { name: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-fg">
              P
            </div>
            <span className="text-sm font-semibold text-text-primary">
              Psalm Creations Business Suite
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-text-muted">{user.role.name}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Welcome back, {user.firstName}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Signed in to {user.organization.name}.
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
          <h2 className="text-base font-medium text-text-primary">
            Your modules will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Customers, products, inventory, quotations, orders, invoices, and
            reporting are being built in sequence. Authentication is complete —
            this is the shell they will fill.
          </p>
        </div>
      </main>
    </>
  );
}
