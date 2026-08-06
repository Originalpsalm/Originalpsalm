import type { ReactNode } from "react";

/** Centred, chrome-free shell for unauthenticated pages. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-background">{children}</div>;
}
