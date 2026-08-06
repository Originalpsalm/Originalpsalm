import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { isOwner, requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui";
import { AdminTabs } from "./AdminTabs";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Students never reach this — requireAdmin returns a 404 rather than a
  // "forbidden" page, so the admin area does not advertise its existence.
  const user = await requireAdmin();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-gold-500/12 text-gold-400">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Admin</h1>
          <p className="text-xs text-mist">
            Signed in as {user.name} · {isOwner(user) ? "Founder" : "Administrator"}
          </p>
        </div>
        <Badge tone={isOwner(user) ? "gold" : "leaf"}>
          {isOwner(user) ? "Owner" : "Admin"}
        </Badge>
        <Link
          href="/dashboard"
          className="focus-ring rounded text-sm text-mist hover:text-chalk"
        >
          Back to app
        </Link>
      </header>

      <AdminTabs isOwner={isOwner(user)} />

      {children}
    </div>
  );
}
