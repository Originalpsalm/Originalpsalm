"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Crown,
  Home,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar, Badge, cn } from "./ui";
import { Logo } from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/practice", label: "Practice", icon: BookOpenCheck },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/friends", label: "Friends", icon: UserRound },
  { href: "/premium", label: "Premium", icon: Crown },
];

export type ShellUser = {
  name: string;
  username: string;
  avatar_hue: number;
  premium: boolean;
  admin: boolean;
};

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 pb-28 pt-5 md:px-6 lg:pb-10">
      {/* ---------------------------------------------- desktop sidebar --- */}
      <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-64 shrink-0 flex-col lg:flex">
        <Link href="/dashboard" className="focus-ring mb-8 rounded-xl px-2">
          <Logo size={34} />
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                isActive(href)
                  ? "bg-leaf-500/12 text-leaf-400"
                  : "text-mist hover:bg-white/5 hover:text-chalk",
              )}
            >
              <Icon size={19} strokeWidth={2.1} />
              {label}
              {href === "/premium" && !user.premium && (
                <span className="ml-auto size-1.5 rounded-full bg-gold-400" />
              )}
            </Link>
          ))}
          {user.admin && (
            <Link
              href="/admin"
              aria-current={isActive("/admin") ? "page" : undefined}
              className={cn(
                "focus-ring mt-2 flex items-center gap-3 rounded-xl border border-gold-500/20 px-3.5 py-2.5 text-sm font-medium transition",
                isActive("/admin")
                  ? "bg-gold-500/12 text-gold-400"
                  : "text-gold-400/80 hover:bg-gold-500/10 hover:text-gold-400",
              )}
            >
              <ShieldCheck size={19} strokeWidth={2.1} />
              Admin
            </Link>
          )}
        </nav>

        <Link
          href="/account"
          className="focus-ring surface mt-auto flex items-center gap-3 p-3 transition hover:border-leaf-500/30"
        >
          <Avatar name={user.name} hue={user.avatar_hue} size={38} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block truncate text-xs text-mist">@{user.username}</span>
          </span>
        </Link>
      </aside>

      {/* -------------------------------------------------------- content --- */}
      <div className="min-w-0 flex-1">
        {/* mobile top bar */}
        <header className="mb-5 flex items-center justify-between lg:hidden">
          <Link href="/dashboard" className="focus-ring rounded-xl">
            <Logo size={30} />
          </Link>
          <div className="flex items-center gap-3">
            {user.premium ? (
              <Badge tone="gold">
                <Crown size={12} /> Premium
              </Badge>
            ) : (
              <Link href="/premium" className="focus-ring rounded-full">
                <Badge tone="gold">Go Premium</Badge>
              </Link>
            )}
            {user.admin && (
              <Link href="/admin" className="focus-ring rounded-full" aria-label="Admin">
                <Badge tone="gold">
                  <ShieldCheck size={12} /> Admin
                </Badge>
              </Link>
            )}
            <Link href="/account" className="focus-ring rounded-full">
              <Avatar name={user.name} hue={user.avatar_hue} size={34} />
            </Link>
          </div>
        </header>

        {children}
      </div>

      {/* ------------------------------------------------- mobile tab bar --- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-leaf-500/12 bg-ink-950/92 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "focus-ring flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                  isActive(href) ? "text-leaf-400" : "text-mist",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg transition",
                    isActive(href) && "bg-leaf-500/12",
                  )}
                >
                  <Icon size={19} strokeWidth={2.1} />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
