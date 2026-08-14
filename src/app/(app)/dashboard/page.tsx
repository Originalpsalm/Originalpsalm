import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Flame,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import {
  attemptsFor,
  groupsForUser,
  incomingRequests,
  studyStreak,
  userStats,
} from "@/lib/queries";
import { EXAM_BODIES } from "@/lib/types";
import { Avatar, Badge, ButtonLink, naira } from "@/components/ui";
import { PREMIUM_PRICE_NAIRA } from "@/lib/billing";

export const metadata = { title: "Home" };

export default async function DashboardPage() {
  const user = await requireUser();
  const premium = isPremium(user);
  const stats = userStats(user.id);
  const streak = studyStreak(user.id);
  const recent = attemptsFor(user.id, 5);
  const groups = groupsForUser(user.id);
  const requests = incomingRequests(user.id);

  const firstName = user.name.split(" ")[0];
  const hour = new Date().getUTCHours() + 1; // WAT is UTC+1
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------ greeting --- */}
      <section className="animate-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mist">{greeting},</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          {premium ? (
            <Badge tone="gold">
              <Crown size={12} /> Premium active
            </Badge>
          ) : (
            <ButtonLink href="/premium" variant="gold" size="sm">
              <Crown size={15} /> Unlock everything
            </ButtonLink>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- stats --- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Flame size={18} />}
          label="Day streak"
          value={streak}
          hint={streak === 0 ? "Answer one question today" : "Keep it alive"}
        />
        <StatCard
          icon={<Target size={18} />}
          label="Accuracy"
          value={`${stats.accuracy}%`}
          hint={`${stats.correct} of ${stats.answered} correct`}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Papers done"
          value={stats.attempts}
          hint="Practice sessions finished"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Study groups"
          value={groups.length}
          hint={groups.length ? "You are studying together" : "Join one today"}
        />
      </section>

      {/* ------------------------------------------------ friend requests --- */}
      {requests.length > 0 && (
        <Link
          href="/friends"
          className="focus-ring card flex items-center gap-4 p-4 transition hover:border-leaf-500/35"
        >
          <div className="flex -space-x-2">
            {requests.slice(0, 3).map((request) => (
              <Avatar
                key={request.id}
                name={request.name}
                hue={request.avatar_hue}
                userId={request.id}
                avatarVersion={request.avatar_version}
                size={34}
                className="ring-2 ring-ink-900"
              />
            ))}
          </div>
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-semibold">
              {requests.length} friend {requests.length === 1 ? "request" : "requests"}
            </span>{" "}
            <span className="text-mist">waiting for you</span>
          </p>
          <ArrowRight size={18} className="shrink-0 text-leaf-400" />
        </Link>
      )}

      {/* ---------------------------------------------------- exam bodies --- */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Start practising</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXAM_BODIES.map((body) => (
            <Link
              key={body.id}
              href={`/practice/${body.id}`}
              className="focus-ring card group p-5 transition hover:border-leaf-500/35"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-leaf-400">{body.name}</span>
                <ArrowRight
                  size={18}
                  className="text-mist transition group-hover:translate-x-0.5 group-hover:text-leaf-400"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mist">{body.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* -------------------------------------------------- recent work --- */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent practice</h2>
            <Link href="/practice" className="focus-ring rounded text-sm text-leaf-400 hover:underline">
              Practise more
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-mist">
                You have not attempted a paper yet. Pick any subject and start — the first five
                questions of every paper are free.
              </p>
              <ButtonLink href="/practice" size="sm" className="mt-4">
                Choose a paper
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((attempt) => {
                const percent = Math.round((attempt.score / attempt.total) * 100);
                return (
                  <li key={attempt.id}>
                    <Link
                      href={`/results/${attempt.id}`}
                      className="focus-ring surface flex items-center gap-4 p-4 transition hover:border-leaf-500/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {attempt.subject}{" "}
                          <span className="text-mist">
                            · {attempt.exam_body} {attempt.year}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-mist">
                          {attempt.score}/{attempt.total} correct ·{" "}
                          {new Date(attempt.finished_at.replace(" ", "T") + "Z").toLocaleDateString(
                            "en-NG",
                            { day: "numeric", month: "short" },
                          )}
                        </p>
                      </div>
                      <ScoreRing percent={percent} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ------------------------------------------------------- groups --- */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Your study groups</h2>
            <Link href="/groups" className="focus-ring rounded text-sm text-leaf-400 hover:underline">
              See all
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-mist">
                Studying alone is hard. Create a group for your class, or join one with an invite
                code from a classmate.
              </p>
              <ButtonLink href="/groups" size="sm" variant="ghost" className="mt-4">
                Find a group
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-2">
              {groups.slice(0, 5).map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/groups/${group.id}`}
                    className="focus-ring surface flex items-center gap-3 p-4 transition hover:border-leaf-500/30"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-leaf-500/10 text-sm font-bold text-leaf-400">
                      {group.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{group.name}</p>
                      <p className="text-xs text-mist">
                        {group.member_count} {group.member_count === 1 ? "member" : "members"}
                        {group.subject ? ` · ${group.subject}` : ""}
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-mist" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ----------------------------------------------------- weak spots --- */}
      {stats.bySubject.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">How you are doing per subject</h2>
          <div className="card divide-y divide-leaf-500/8 p-2">
            {stats.bySubject.map((row) => {
              const percent = row.answered ? Math.round((row.correct / row.answered) * 100) : 0;
              return (
                <div key={row.subject} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-36 shrink-0 truncate text-sm font-medium">{row.subject}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full brand-gradient transition-[width] duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- upsell --- */}
      {!premium && (
        <section className="card relative overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-56 rounded-full bg-gold-500/10 blur-3xl"
          />
          <Badge tone="gold">
            <Crown size={12} /> GURU Premium
          </Badge>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            You are seeing 5 questions per paper.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
            Premium opens every question in every paper, with the full working on each one, plus
            unlimited timed mocks. {naira(PREMIUM_PRICE_NAIRA)} a month, cancel whenever you like.
          </p>
          <ButtonLink href="/premium" variant="gold" className="mt-6">
            See what you get <ArrowRight size={16} />
          </ButtonLink>
        </section>
      )}
    </div>
  );
}

function StatCard({
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

/** Small circular score indicator, drawn with a conic gradient. */
function ScoreRing({ percent }: { percent: number }) {
  const tone = percent >= 70 ? "#17c471" : percent >= 50 ? "#f5b301" : "#ef4444";
  return (
    <div
      className="grid size-12 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${tone} ${percent * 3.6}deg, rgba(255,255,255,.07) 0)` }}
    >
      <span className="grid size-9 place-items-center rounded-full bg-ink-900 text-xs font-bold tabular-nums">
        {percent}%
      </span>
    </div>
  );
}
