import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAuthContext } from "@/lib/auth/session";

/**
 * Shell for authenticated pages.
 *
 * The session check lives here so every page beneath it is protected by
 * construction — a new page cannot forget to guard itself.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await getAuthContext())) {
    redirect("/login");
  }

  return <div className="flex min-h-dvh flex-col bg-background">{children}</div>;
}
