import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { StatusBadge } from "@/components/opportunity/opportunity-card";
import {
  ArrowRight,
  ButtonLink,
  Card,
  Container,
  Notice,
  SampleBadge,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { byStatus, visibleOpportunities } from "@/content/opportunities";
import { reporting } from "@/content/investing";
import { flags } from "@/content/site";
import { naira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Track record",
  description:
    "Closed Green-X Farm rounds and their reported outcomes — including the undercapitalised founder-funded cycle that shaped how we now structure every round.",
};

export default function TrackRecordPage() {
  const visible = visibleOpportunities(flags.showSampleDeals);
  const closed = byStatus(visible, "closed");
  const real = closed.filter((o) => !o.isSample);
  const samples = closed.filter((o) => o.isSample);
  const verifiedCapital = real.reduce((sum, o) => sum + o.committed, 0);

  return (
    <>
      <PageHero
        eyebrow="Track record"
        title="Including the cycle that did not work."
        lead="A track record that only contains successes is a marketing document. Ours opens with the undercapitalised cycle that cost the founders their own money, because that failure is the reason every round since has been structured the way it is."
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="text-sm text-text-muted">Closed rounds</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {closed.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Verified own capital deployed</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {naira(verifiedCapital)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Cycles reported in full</dt>
            <dd className="font-display text-2xl font-semibold text-text-primary">
              {real.length}
            </dd>
          </div>
        </dl>
      </PageHero>

      {/* ------------------------------------------------ Verified record */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Verified"
            title="Completed cycles"
            lead="Rounds that actually happened, with their real outcome."
          />
          <div className="mt-10 space-y-6">
            {real.map((opportunity, i) => (
              <Reveal key={opportunity.slug} delay={i * 60}>
                <ClosedRoundCard slug={opportunity.slug}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={opportunity.status} />
                    <span className="font-mono text-xs tracking-wide text-text-muted">
                      {opportunity.code}
                    </span>
                    <span className="text-xs text-text-muted">
                      {opportunity.cycle}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl leading-snug font-semibold text-text-primary">
                    {opportunity.name}
                  </h3>
                  <p className="mt-2 text-base leading-8 text-pretty text-text-secondary">
                    {opportunity.tagline}
                  </p>

                  {opportunity.outcome ? (
                    <>
                      <p className="mt-6 border-t border-border-subtle pt-6 text-sm leading-7 text-pretty text-text-secondary">
                        {opportunity.outcome.summary}
                      </p>
                      <dl className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {opportunity.outcome.metrics.map((metric) => (
                          <div key={metric.label}>
                            <dt className="text-sm text-text-muted">
                              {metric.label}
                            </dt>
                            <dd className="mt-1 text-base font-medium text-text-primary">
                              {metric.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  ) : null}

                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Full round detail
                    <ArrowRight />
                  </Link>
                </ClosedRoundCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- Samples */}
      {samples.length > 0 ? (
        <Section tone="sunken">
          <Container>
            <SectionHeading
              eyebrow="Placeholder"
              title="Sample closed rounds"
              lead="These entries demonstrate how a completed round is presented on this platform. They are not real."
            />

            <Notice tone="warning" className="mt-8">
              <strong className="font-semibold">
                Do not present these as a track record.
              </strong>{" "}
              Every entry below is placeholder content used to show the layout
              of a closed round. Set{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                flags.showSampleDeals
              </code>{" "}
              to <code className="font-mono text-xs">false</code> in{" "}
              <code className="font-mono text-xs">content/site.ts</code> to
              remove them from the whole site in one edit.
            </Notice>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {samples.map((opportunity, i) => (
                <Reveal key={opportunity.slug} delay={i * 60}>
                  <Card className="relative flex h-full flex-col border-dashed p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <SampleBadge />
                      <span className="ml-auto font-mono text-xs tracking-wide text-text-muted">
                        {opportunity.code}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg leading-snug font-semibold text-text-primary">
                      <Link
                        href={`/opportunities/${opportunity.slug}`}
                        className="before:absolute before:inset-0 before:content-['']"
                      >
                        {opportunity.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-pretty text-text-secondary">
                      {opportunity.tagline}
                    </p>

                    <div className="grow" />

                    <dl className="mt-6 space-y-2 border-t border-border-subtle pt-5">
                      {opportunity.outcome?.metrics.slice(0, 3).map((metric) => (
                        <div
                          key={metric.label}
                          className="flex items-baseline justify-between gap-4 text-sm"
                        >
                          <dt className="text-text-muted">{metric.label}</dt>
                          <dd className="text-right font-medium text-text-primary">
                            {metric.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------- Reporting */}
      <Section tone={samples.length > 0 ? "default" : "sunken"}>
        <Container>
          <SectionHeading
            eyebrow="Reporting"
            title="What a participant actually receives"
            lead="Records are established from day one — not reconstructed at the end of a cycle."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {reporting.map((item, i) => (
              <Reveal key={item.item} delay={i * 60}>
                <Card className="h-full p-6">
                  <p className="font-mono text-xs tracking-wide text-primary uppercase">
                    {item.cadence}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-text-primary">
                    {item.item}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-pretty text-text-secondary">
                    {item.detail}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/portal" variant="secondary">
              Preview the investor room
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/opportunities" variant="ghost">
              See open rounds
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ClosedRoundCard({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={slug} className="scroll-mt-24 p-7 sm:p-9">
      {children}
    </Card>
  );
}
