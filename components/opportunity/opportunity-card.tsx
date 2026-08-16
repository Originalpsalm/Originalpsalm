import Link from "next/link";

import {
  ArrowRight,
  Badge,
  Card,
  SampleBadge,
  type BadgeTone,
} from "@/components/ui/primitives";
import {
  statusLabels,
  type Opportunity,
  type OpportunityStatus,
} from "@/content/opportunities";
import { cn, naira, percent } from "@/lib/format";

export const statusTones: Record<OpportunityStatus, BadgeTone> = {
  open: "success",
  upcoming: "primary",
  closed: "neutral",
  pipeline: "harvest",
};

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  return (
    <Badge tone={statusTones[status]}>
      {status === "open" ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-current motion-safe:animate-pulse"
        />
      ) : null}
      {statusLabels[status]}
    </Badge>
  );
}

/**
 * Progress toward the funding target.
 *
 * Rounds that have not opened yet show the target rather than an empty bar —
 * a 0% bar reads as a failed raise rather than one that has not started.
 */
export function FundingBar({
  committed,
  target,
  tone = "default",
  notOpen = false,
  notOpenLabel = "Target",
}: {
  committed: number;
  target: number;
  tone?: "default" | "muted";
  notOpen?: boolean;
  notOpenLabel?: string;
}) {
  const pct = percent(committed, target);

  if (notOpen) {
    return (
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-text-muted">{notOpenLabel}</p>
        <p className="text-sm font-semibold text-text-primary">
          {naira(target)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-text-primary">
          {naira(committed)}
          <span className="font-normal text-text-muted"> of {naira(target)}</span>
        </p>
        <p className="text-sm font-semibold tabular-nums text-primary">{pct}%</p>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Funding progress"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700",
            tone === "muted" ? "bg-border-strong" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
  featured = false,
}: {
  opportunity: Opportunity;
  featured?: boolean;
}) {
  const closed = opportunity.status === "closed";
  const notOpen =
    opportunity.status === "upcoming" || opportunity.status === "pipeline";

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:shadow-lg sm:p-7",
        featured && "ring-1 ring-primary-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={opportunity.status} />
        {opportunity.isSample ? <SampleBadge /> : null}
        <span className="ml-auto font-mono text-xs tracking-wide text-text-muted">
          {opportunity.code}
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl leading-snug font-semibold text-text-primary">
        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="before:absolute before:inset-0 before:content-['']"
        >
          {opportunity.name}
        </Link>
      </h3>

      <p className="mt-2.5 text-sm leading-6 text-pretty text-text-secondary">
        {opportunity.tagline}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border-subtle pt-5 text-sm">
        <div>
          <dt className="text-xs text-text-muted">Crop</dt>
          <dd className="mt-0.5 font-medium text-text-primary">
            {opportunity.crop}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Location</dt>
          <dd className="mt-0.5 font-medium text-text-primary">
            {opportunity.location.split("—")[0]?.trim()}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grow" />

      <div className="mt-5">
        <FundingBar
          committed={opportunity.committed}
          target={opportunity.target}
          tone={closed ? "muted" : "default"}
          notOpen={notOpen}
          notOpenLabel={
            opportunity.status === "pipeline"
              ? "Indicative size"
              : "Target"
          }
        />
      </div>

      <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {closed ? "View outcome" : "View opportunity"}
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </p>
    </Card>
  );
}
