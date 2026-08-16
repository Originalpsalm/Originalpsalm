import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  FundingBar,
  StatusBadge,
} from "@/components/opportunity/opportunity-card";
import {
  ArrowRight,
  Badge,
  ButtonLink,
  Card,
  Container,
  DataRow,
  Notice,
  SampleBadge,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  findOpportunity,
  opportunities,
  statusDescriptions,
} from "@/content/opportunities";
import { flags } from "@/content/site";
import { naira, percent } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = findOpportunity(slug);
  if (!opportunity) return { title: "Opportunity not found" };
  return {
    title: `${opportunity.name} (${opportunity.code})`,
    description: opportunity.tagline,
  };
}

export default async function OpportunityPage({ params }: Params) {
  const { slug } = await params;
  const opportunity = findOpportunity(slug);

  if (!opportunity) notFound();
  if (opportunity.isSample && !flags.showSampleDeals) notFound();

  const {
    code,
    name,
    tagline,
    status,
    isSample,
    crop,
    location,
    cycle,
    target,
    committed,
    ticketMin,
    horizon,
    instruments,
    summary,
    useOfFunds,
    assumptions,
    advantages,
    kpis,
    risks,
    timeline,
    outcome,
  } = opportunity;

  const budgetTotal = useOfFunds?.reduce((sum, line) => sum + line.amount, 0);
  const open = status === "open";
  const notOpen = status === "upcoming" || status === "pipeline";

  return (
    <>
      {/* --------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div aria-hidden className="gx-grid-bg absolute inset-0" />
        <Container className="relative py-12 sm:py-16">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-primary"
          >
            <ArrowRight className="rotate-180" />
            All opportunities
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={status} />
                {isSample ? <SampleBadge /> : null}
                <span className="font-mono text-xs tracking-wide text-text-muted">
                  {code}
                </span>
              </div>

              <h1 className="mt-5 font-display text-3xl leading-[1.12] font-semibold text-balance sm:text-4xl lg:text-[2.75rem]">
                {name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-pretty text-text-secondary sm:text-lg">
                {tagline}
              </p>

              {isSample ? (
                <Notice tone="warning" className="mt-7 max-w-2xl">
                  <strong className="font-semibold">
                    This is a sample entry.
                  </strong>{" "}
                  It demonstrates how a completed round is presented on this
                  platform. It does not represent capital actually raised or
                  deployed.
                </Notice>
              ) : null}
            </div>

            {/* Sticky summary panel */}
            <div className="lg:pt-2">
              <Card className="p-6 shadow-sm sm:p-7">
                <p className="text-xs font-semibold tracking-[0.14em] text-text-muted uppercase">
                  {open
                    ? "Seeking"
                    : status === "pipeline"
                      ? "Indicative size"
                      : status === "upcoming"
                        ? "Target size"
                        : "Round size"}
                </p>
                <p className="mt-2 font-display text-4xl font-semibold text-text-primary">
                  {naira(target)}
                </p>

                {notOpen ? null : (
                  <div className="mt-6">
                    <FundingBar
                      committed={committed}
                      target={target}
                      tone={status === "closed" ? "muted" : "default"}
                    />
                  </div>
                )}

                <dl className="mt-6 border-t border-border-subtle pt-2">
                  <DataRow label="Status">
                    {statusDescriptions[status]}
                  </DataRow>
                  <DataRow label="Cycle">{cycle}</DataRow>
                  <DataRow label="Horizon">{horizon}</DataRow>
                  {ticketMin ? (
                    <DataRow label="Minimum">{naira(ticketMin)}</DataRow>
                  ) : null}
                  <DataRow label="Location">{location}</DataRow>
                  <DataRow label="Crop">{crop}</DataRow>
                </dl>

                {open ? (
                  <ButtonLink
                    href={`/contact?round=${code}`}
                    className="mt-6 w-full px-6 py-3"
                  >
                    Enquire about this round
                    <ArrowRight />
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href="/opportunities"
                    variant="secondary"
                    className="mt-6 w-full px-6 py-3"
                  >
                    See open rounds
                  </ButtonLink>
                )}

                <p className="mt-4 text-xs leading-6 text-text-muted">
                  Not an offer of securities. Participation is subject to
                  separately documented terms.
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Outcome */}
      {outcome ? (
        <Section tone="sunken" className="py-14 sm:py-16">
          <Container>
            <SectionHeading eyebrow="Outcome" title="How this round closed" />
            <Card className="mt-8 p-7 sm:p-9">
              <p className="text-base leading-8 text-pretty text-text-secondary">
                {outcome.summary}
              </p>
              <dl className="mt-8 grid gap-6 border-t border-border-subtle pt-8 sm:grid-cols-2 lg:grid-cols-3">
                {outcome.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt className="text-sm text-text-muted">{metric.label}</dt>
                    <dd className="mt-1 font-display text-lg font-semibold text-text-primary">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------ Summary */}
      <Section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Overview" title="What this round funds" />
              <div className="mt-7 space-y-5 text-base leading-8 text-pretty text-text-secondary">
                {summary.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-text-primary">
                Ways to participate
              </h3>
              <ul className="mt-5 space-y-3">
                {instruments.map((instrument) => (
                  <li
                    key={instrument}
                    className="flex gap-3 text-sm leading-7 text-text-secondary"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {instrument}
                  </li>
                ))}
              </ul>
              <Link
                href="/invest"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                How each instrument works
                <ArrowRight />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- Use of funds */}
      {useOfFunds && budgetTotal ? (
        <Section tone="sunken">
          <Container>
            <SectionHeading
              eyebrow="Use of funds"
              title="Every naira, line by line"
              lead="Final line-item amounts are updated against current supplier quotations before expenditure. Project funds are ring-fenced and recorded."
            />

            <Card className="mt-10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Line-item budget for {name}
                </caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-sunken">
                    <th scope="col" className="px-5 py-3.5 font-medium text-text-muted sm:px-7">
                      Budget line
                    </th>
                    <th scope="col" className="hidden px-5 py-3.5 text-right font-medium text-text-muted sm:table-cell">
                      Share
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium text-text-muted sm:px-7">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {useOfFunds.map((line) => (
                    <tr
                      key={line.item}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <th
                        scope="row"
                        className="px-5 py-3.5 text-left font-normal text-text-primary sm:px-7"
                      >
                        {line.item}
                      </th>
                      <td className="hidden px-5 py-3.5 text-right sm:table-cell">
                        <div className="flex items-center justify-end gap-3">
                          <span className="tabular-nums text-text-muted">
                            {percent(line.amount, budgetTotal)}%
                          </span>
                          <span
                            aria-hidden
                            className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-sunken"
                          >
                            <span
                              className="block h-full rounded-full bg-primary/70"
                              style={{
                                width: `${percent(line.amount, budgetTotal)}%`,
                              }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-text-primary sm:px-7">
                        {naira(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-sunken font-semibold">
                    <th scope="row" className="px-5 py-4 text-left sm:px-7">
                      Total
                    </th>
                    <td className="hidden sm:table-cell" />
                    <td className="px-5 py-4 text-right tabular-nums sm:px-7">
                      {naira(budgetTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Card>
          </Container>
        </Section>
      ) : null}

      {/* ---------------------------------------------------- Assumptions */}
      {assumptions ? (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Planning assumptions"
              title="What we assume — and what we have not yet verified"
              lead="We publish assumptions as assumptions. Where a figure has not been physically verified, we say so rather than converting it into a forecast."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {assumptions.map((assumption, i) => (
                <Reveal key={assumption.label} delay={i * 60}>
                  <Card className="h-full p-6">
                    <p className="text-sm text-text-muted">
                      {assumption.label}
                    </p>
                    <p className="mt-1.5 font-display text-xl font-semibold text-text-primary">
                      {assumption.value}
                    </p>
                    {assumption.note ? (
                      <p className="mt-3 text-sm leading-7 text-pretty text-text-secondary">
                        {assumption.note}
                      </p>
                    ) : null}
                  </Card>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ----------------------------------------------------- Advantages */}
      {advantages ? (
        <Section tone="invert" className="relative overflow-hidden">
          <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-40" />
          <Container className="relative">
            <SectionHeading
              tone="invert"
              eyebrow="Position"
              title="What is already in place"
              lead="The constraint on this project is working capital — not land, not labour, not technical skill."
            />
            <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {advantages.map((advantage, i) => (
                <Reveal key={advantage.label} delay={i * 55}>
                  <div className="border-t border-white/12 pt-5">
                    <h3 className="font-display text-base font-semibold text-text-inverted">
                      {advantage.label}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-text-inverted/60">
                      {advantage.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------- Timeline */}
      {timeline ? (
        <Section tone="sunken">
          <Container>
            <SectionHeading
              eyebrow="Implementation"
              title="How the cycle runs"
              lead="Eleven steps from confirming land access to reinvesting an agreed portion of proceeds into the next cycle."
            />
            <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {timeline.map((item, i) => (
                <Reveal key={item.step} delay={i * 40}>
                  <li className="border-t-2 border-primary/25 pt-4">
                    <p className="font-mono text-xs font-medium tracking-wide text-primary">
                      {item.step}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-pretty text-text-secondary">
                      {item.detail}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </Container>
        </Section>
      ) : null}

      {/* ----------------------------------------------------------- KPIs */}
      {kpis ? (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Accountability"
              title="What gets measured and reported"
              lead="Green-X maintains records of expenditure and production progress and provides reasonable evidence of how supported funds are deployed."
            />
            <Card className="mt-10 overflow-hidden">
              <dl className="divide-y divide-border-subtle">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="grid gap-1 px-6 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6 sm:px-8"
                  >
                    <dt className="font-medium text-text-primary">
                      {kpi.label}
                    </dt>
                    <dd className="text-sm leading-7 text-text-secondary">
                      {kpi.measure}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Container>
        </Section>
      ) : null}

      {/* ----------------------------------------------------------- Risk */}
      {risks ? (
        <Section tone="sunken">
          <Container>
            <SectionHeading
              eyebrow="Risk"
              title="Named risks, named controls"
              lead="Agricultural investment carries a real risk of partial or total capital loss. These are the risks we consider material to this round and what we do about each one."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {risks.map((item, i) => (
                <Reveal key={item.risk} delay={i * 50}>
                  <Card className="h-full p-6">
                    <Badge tone="danger">{item.risk}</Badge>
                    <p className="mt-4 text-sm leading-7 text-pretty text-text-secondary">
                      {item.mitigation}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------------ CTA */}
      {open ? (
        <Section>
          <Container>
            <Card className="relative overflow-hidden bg-surface-invert p-10 text-text-inverted sm:p-14">
              <div
                aria-hidden
                className="gx-grid-bg absolute inset-0 opacity-50"
              />
              <div className="relative max-w-2xl">
                <h2 className="font-display text-3xl leading-tight font-semibold text-balance text-text-inverted">
                  Interested in {code}?
                </h2>
                <p className="mt-5 text-base leading-8 text-text-inverted/65">
                  Tell us how you would prefer to participate. We respond with
                  the current budget, the verification status of each assumption
                  and any open supplier quotations.
                </p>
                <ButtonLink
                  href={`/contact?round=${code}`}
                  variant="invert"
                  className="mt-8 px-6 py-3"
                >
                  Start the conversation
                  <ArrowRight />
                </ButtonLink>
              </div>
            </Card>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
