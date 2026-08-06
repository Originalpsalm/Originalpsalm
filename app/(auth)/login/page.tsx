import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAuthContext } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Someone already signed in has no reason to see this page.
  if (await getAuthContext()) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-fg">
            P
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Welcome back to Psalm Creations Business Suite.
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Trouble signing in? Contact your administrator.
        </p>
      </div>
    </main>
  );
}
