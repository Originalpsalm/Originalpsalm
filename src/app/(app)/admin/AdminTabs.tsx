"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const TABS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Students" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/groups", label: "Groups" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/activity", label: "Activity log" },
];

export function AdminTabs({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-1.5 border-b border-leaf-500/12 pb-px">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring block rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-medium transition",
                  active
                    ? "border-leaf-400 text-leaf-400"
                    : "border-transparent text-mist hover:text-chalk",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
        {isOwner && (
          <li className="ml-2 self-center text-xs text-mist/60">
            Founder account — you alone can promote staff
          </li>
        )}
      </ul>
    </nav>
  );
}
