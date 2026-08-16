import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import {
  Container,
  Notice,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  byStatus,
  statusDescriptions,
  visibleOpportunities,
  type OpportunityStatus,
} from "@/content/opportunities";
import { flags } from "@/content/site";
import { naira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Investment opportunities",
  description:
    "Open, upcoming and closed Green-X Farm investment rounds — each with a published line-item budget, stated assumptions and a named risk control.",
};

const groups: { status: OpportunityStatus; heading: string }[] = [
  { status: "open", heading: "Open now" },
  { status: "upcoming", heading: "Upcoming rounds" },
  { status: "pipeline", heading: "Pipeline — under research" },
  { status: "closed", heading: "Closed rounds" },
];

export default function OpportunitiesPage() {
  const visible = visibleOpportunities(flags.showSampleDeals);
  const open = byStatus(visible, "open");
  const openTotal = open.reduce((sum, o) => sum + o.target, 0);
  const hasSamples = visible.some((o) => o.isSample);

  return (
    <>
      <PageHero
        eyebrow="Investment opportunities"
        title="Bounded rounds with published budgets."
        lead="Each opportunity funds one defined activity. You see the line-item budget, the assumptions and their verification status, the named risks and the controls against them — before you commit anything."
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="text-sm text-text-muted">Open rounds</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {open.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Currently seeking</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {naira(openTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Minimum participation</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {naira(250_000)}
            </dd>
          </div>
        </dl>
      </PageHero>

      {hasSamples ? (
        <Container className="pt-10">
          <Notice tone="warning">
            <strong className="font-semibold">Placeholder content.</strong> Some
            closed rounds below are marked{" "}
            <span className="font-semibold">Sample</span>. They exist to
            demonstrate how a completed round is presented and do not represent
            capital actually raised. Set{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
              flags.showSampleDeals
            </code>{" "}
            to <code className="font-mono text-xs">false</code> in{" "}
            <code className="font-mono text-xs">content/site.ts</code> to hide
            them entirely.
          </Notice>
        </Container>
      ) : null}

      {groups.map((group, groupIndex) => {
        const items = byStatus(visible, group.status);
        if (items.length === 0) return null;

        return (
          <Section
            key={group.status}
            tone={groupIndex % 2 === 1 ? "sunken" : "default"}
            className={groupIndex === 0 ? "pt-14 sm:pt-16" : undefined}
          >
            <Container>
              <SectionHeading
                title={group.heading}
                lead={statusDescriptions[group.status]}
              />
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((opportunity, i) => (
                  <Reveal key={opportunity.slug} delay={i * 70}>
                    <OpportunityCard
                      opportunity={opportunity}
                      featured={opportunity.status === "open"}
                    />
                  </Reveal>
                ))}
              </div>
            </Container>
          </Section>
        );
      })}
    </>
  );
}
