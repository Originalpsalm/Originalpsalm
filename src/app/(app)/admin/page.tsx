import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  CircleAlert,
  Lock,
  MessageSquare,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { overview, signupTrend } from "@/lib/admin";
import { naira } from "@/components/ui";

export default function AdminOverviewPage() {
  const stats = overview();
  const trend = signupTrend(14);
  const peak = Math.max(1, ...trend.map((day) => day.n));

  return (
    <div className="space-y-5">
      {/* Anything needing attention is surfaced before the vanity numbers. */}
      {(stats.pendingPayments > 0 || stats.locked > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.pendingPayments > 0 && (
            <Link
              href="/admin/payments?status=pending"
              className="focus-ring card flex items-center gap-3 border-gold-500/30 p-4 transition hover:border-gold-500/60"
            >
              <CircleAlert size={20} className="shrink-0 text-gold-400" />
              <p className="text-sm">
                <span className="font-bold">{stats.pendingPayments}</span> payment
                {stats.pendingPayments === 1 ? "" : "s"} started but never confirmed
                <span className="block text-xs text-mist">
                  Usually abandoned checkouts — check before anyone complains
                </span>
              </p>
            </Link>
          )}
          {stats.locked > 0 && (
            <Link
              href="/admin/users?filter=locked"
              className="focus-ring card flex items-center gap-3 border-red-500/30 p-4 transition hover:border-red-500/60"
            >
              <Lock size={20} className="shrink-0 text-red-300" />
              <p className="text-sm">
                <span className="font-bold">{stats.locked}</span> account
                {stats.locked === 1 ? "" : "s"} locked for device sharing
                <span className="block text-xs text-mist">
                  Some will be honest students who changed phone
                </span>
              </p>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Users size={17} />} label="Students" value={stats.users}
              hint={`${stats.newThisWeek} joined this week`} />
        <Stat icon={<BadgeCheck size={17} />} label="Paying" value={stats.premium}
              hint={stats.users ? `${Math.round((stats.premium / stats.users) * 100)}% of students` : "—"} />
        <Stat icon={<Wallet size={17} />} label="Revenue" value={naira(stats.revenueNaira)}
              hint={`${naira(stats.revenueThisMonthNaira)} this month`} />
        <Stat icon={<BookOpenCheck size={17} />} label="Papers sat" value={stats.attempts}
              hint={`${stats.attemptsThisWeek} this week`} />
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={17} className="text-leaf-400" />
          <h2 className="text-sm font-bold">Sign-ups, last 14 days</h2>
        </div>
        <div className="flex h-28 items-end gap-1.5">
          {trend.map((day) => (
            <div key={day.day} className="group flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] tabular-nums text-mist opacity-0 transition group-hover:opacity-100">
                {day.n}
              </span>
              <div
                className="w-full rounded-t brand-gradient transition-all"
                style={{ height: `${Math.max(3, (day.n / peak) * 100)}%` }}
                title={`${day.day}: ${day.n} sign-ups`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-mist">
          <span>{trend[0]?.day.slice(5)}</span>
          <span>today</span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat icon={<Users size={17} />} label="Study groups" value={stats.groups} hint="Created by students" />
        <Stat icon={<MessageSquare size={17} />} label="Messages" value={stats.messages} hint="Across all groups" />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-mist">
        <span className="text-leaf-400">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-xs text-mist/80">{hint}</p>
    </div>
  );
}
