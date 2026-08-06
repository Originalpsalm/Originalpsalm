import Link from "next/link";
import { Crown, Lock, Search, ShieldCheck } from "lucide-react";
import { listUsers, type UserFilter } from "@/lib/admin";
import { Avatar, Badge, cn, inputClass } from "@/components/ui";

type Props = { searchParams: Promise<{ q?: string; filter?: string; page?: string }> };

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "premium", label: "Paying" },
  { id: "free", label: "Free" },
  { id: "locked", label: "Locked" },
  { id: "staff", label: "Staff" },
];

const PER_PAGE = 25;

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const filter = (FILTERS.find((f) => f.id === params.filter)?.id ?? "all") as UserFilter;
  const page = Math.max(1, Number(params.page ?? 1));

  const { rows, total } = listUsers({
    query,
    filter,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-4">
      <form className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by name, username, email or school…"
          aria-label="Search students"
          className={inputClass + " pl-11"}
        />
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((entry) => {
          const href = `/admin/users?${new URLSearchParams({
            ...(query ? { q: query } : {}),
            ...(entry.id === "all" ? {} : { filter: entry.id }),
          })}`;
          return (
            <Link
              key={entry.id}
              href={href}
              className={cn(
                "focus-ring rounded-full border px-3 py-1 text-xs font-semibold transition",
                filter === entry.id
                  ? "border-leaf-500/45 bg-leaf-500/12 text-leaf-400"
                  : "border-leaf-500/12 text-mist hover:text-chalk",
              )}
            >
              {entry.label}
            </Link>
          );
        })}
        <span className="ml-auto text-xs text-mist tabular-nums">
          {total} {total === 1 ? "student" : "students"}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          Nobody matches that. Try a different search or filter.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const premium =
              row.plan === "premium" &&
              row.plan_expires_at !== null &&
              new Date(row.plan_expires_at.replace(" ", "T") + "Z") > new Date();
            const locked =
              row.locked_until !== null &&
              new Date(row.locked_until.replace(" ", "T") + "Z") > new Date();

            return (
              <li key={row.id}>
                <Link
                  href={`/admin/users/${row.id}`}
                  className="focus-ring card flex flex-wrap items-center gap-3 p-4 transition hover:border-leaf-500/35"
                >
                  <Avatar name={row.name} hue={row.avatar_hue} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      <span className="truncate">{row.name}</span>
                      {row.role !== "student" && (
                        <Badge tone={row.role === "owner" ? "gold" : "leaf"}>
                          <ShieldCheck size={11} /> {row.role}
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-mist">
                      @{row.username} · {row.email}
                    </p>
                    {row.school && <p className="truncate text-xs text-mist/70">{row.school}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {locked && (
                      <Badge tone="red">
                        <Lock size={11} /> Locked
                      </Badge>
                    )}
                    {premium ? (
                      <Badge tone="gold">
                        <Crown size={11} /> Premium
                      </Badge>
                    ) : (
                      <Badge tone="mist">Free</Badge>
                    )}
                    <span className="w-20 text-right text-xs text-mist tabular-nums">
                      {row.attempts} paper{row.attempts === 1 ? "" : "s"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-3 pt-2 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(filter !== "all" ? { filter } : {}), page: String(page - 1) })}`}
              className="focus-ring rounded text-leaf-400 hover:underline"
            >
              ← Previous
            </Link>
          )}
          <span className="text-mist tabular-nums">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link
              href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(filter !== "all" ? { filter } : {}), page: String(page + 1) })}`}
              className="focus-ring rounded text-leaf-400 hover:underline"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
