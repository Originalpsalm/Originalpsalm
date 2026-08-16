import Link from "next/link";

import { OpportunityCard } from "@/components/opportunity/opportunity-card";
import {
  ArrowRight,
  Badge,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
  Stat,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  byStatus,
  visibleOpportunities,
} from "@/content/opportunities";
import { projects, stageLabels } from "@/content/projects";
import { phases } from "@/content/roadmap";
import { flags, headlineStats, philosophy, site } from "@/content/site";

export default function HomePage() {
  const visible = visibleOpportunities(flags.showSampleDeals);
  const open = byStatus(visible, "open");
  const upcoming = byStatus(visible, "upcoming");
  const featured = [...open, ...upcoming].slice(0, 3);
  const closedCount = byStatus(visible, "closed").length;
  const activeProjects = projects.slice(0, 4);

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <div aria-hidden className="gx-grid-bg absolute inset-0" />
        <div
          aria-hidden
          className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-52 -left-40 size-[30rem] rounded-full bg-accent/[0.07] blur-3xl"
        />

        <Container className="relative py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <Badge tone="primary" className="mb-7">
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              Phase 0 · Capital &amp; market validation
            </Badge>

            <h1 className="font-display text-4xl leading-[1.06] font-semibold text-balance sm:text-5xl lg:text-6xl">
              We are building an agro-industrial group{" "}
              <span className="text-primary">one proven layer at a time.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-text-secondary">
              Green-X Farm starts where the cash is: disciplined dry-season
              tomato production in the Abuja–Nasarawa corridor. Each successful
              operating unit funds the next — production supports aggregation,
              aggregation supports processing, processing supports export.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink href="/opportunities" className="px-6 py-3">
                View investment opportunities
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/roadmap" variant="secondary" className="px-6 py-3">
                See the roadmap
              </ButtonLink>
            </div>

            <p className="mt-7 text-sm text-text-muted">
              {open.length} open {open.length === 1 ? "round" : "rounds"} ·{" "}
              {upcoming.length} upcoming · {closedCount} closed ·{" "}
              {site.headquarters}
            </p>
          </div>

          <dl className="mt-16 grid gap-8 border-t border-border-subtle pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {headlineStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <Stat
                  value={stat.value}
                  label={stat.label}
                  detail={stat.detail}
                />
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* ------------------------------------------------- Opportunities */}
      <Section id="opportunities">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Open to investors"
              title="Current investment opportunities"
              lead="Every round funds one defined activity with a published line-item budget. We do not raise general-purpose capital against a vision."
            />
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              All opportunities
              <ArrowRight />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((opportunity, i) => (
              <Reveal key={opportunity.slug} delay={i * 80}>
                <OpportunityCard
                  opportunity={opportunity}
                  featured={opportunity.status === "open"}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------- Philosophy */}
      <Section tone="invert" className="relative overflow-hidden">
        <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-40" />
        <Container className="relative">
          <SectionHeading
            tone="invert"
            eyebrow="How we operate"
            title="Discipline is the product"
            lead="Agriculture rarely fails because the idea was wrong. It fails because capital ran out mid-cycle, or because a good season was mistaken for a proven business."
          />

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="border-t border-white/12 pt-5">
                  <h3 className="font-display text-lg font-semibold text-text-inverted">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-7 text-text-inverted/60">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ Roadmap */}
      <Section tone="sunken">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="The long game"
                title="From one hectare to an integrated group"
                lead="Green-X does not begin by trying to look like an agro-industrial group. It begins by becoming exceptionally good at producing and moving agricultural value."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/roadmap" variant="secondary">
                  Full development roadmap
                </ButtonLink>
                <ButtonLink href="/projects" variant="ghost">
                  Project pipeline
                  <ArrowRight />
                </ButtonLink>
              </div>
            </div>

            <ol className="relative space-y-0">
              {phases.map((phase, i) => (
                <Reveal key={phase.id} delay={i * 50}>
                  <li className="relative flex gap-5 pb-8 last:pb-0">
                    {i < phases.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute top-8 bottom-0 left-[0.6875rem] w-px bg-border-strong"
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={
                        phase.status === "current"
                          ? "relative z-10 mt-1.5 size-[1.375rem] shrink-0 rounded-full border-4 border-primary bg-background ring-4 ring-primary/15"
                          : phase.status === "next"
                            ? "relative z-10 mt-1.5 size-[1.375rem] shrink-0 rounded-full border-4 border-border-strong bg-background"
                            : "relative z-10 mt-1.5 size-[1.375rem] shrink-0 rounded-full border-4 border-border-subtle bg-surface-sunken"
                      }
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-medium tracking-wide text-primary">
                          {phase.id}
                        </span>
                        {phase.status === "current" ? (
                          <Badge tone="success">Current</Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-1 font-display text-lg font-semibold text-text-primary">
                        {phase.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-7 text-pretty text-text-secondary">
                        {phase.objective}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------- Pipeline */}
      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="What comes next"
              title="Projects we intend to launch"
              lead="Each pipeline project carries an explicit precondition. None of them raise capital until their economics are verified."
            />
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              All projects
              <ArrowRight />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {activeProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 70}>
                <Card className="flex h-full flex-col p-6 transition-colors hover:border-primary-border">
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      tone={project.stage === "active" ? "success" : "neutral"}
                    >
                      {stageLabels[project.stage]}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-text-primary">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-pretty text-text-secondary">
                    {project.summary}
                  </p>
                  <p className="mt-4 border-t border-border-subtle pt-4 text-xs leading-6 text-text-muted">
                    <span className="font-medium text-text-secondary">
                      Precondition:
                    </span>{" "}
                    {project.precondition}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- CTA */}
      <Section tone="sunken" className="border-t border-border-subtle">
        <Container>
          <Card className="relative overflow-hidden bg-surface-invert p-10 text-text-inverted sm:p-14">
            <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-50" />
            <div
              aria-hidden
              className="absolute -top-24 -right-16 size-72 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <Eyebrow tone="invert">Work with us</Eyebrow>
              <h2 className="font-display text-3xl leading-tight font-semibold text-balance text-text-inverted sm:text-4xl">
                Catalytic capital for a bounded, measurable cycle.
              </h2>
              <p className="mt-5 text-base leading-8 text-pretty text-text-inverted/65">
                We welcome full or partial project funding, equipment and input
                sponsorship, strategic partnership, or other structured support
                that gets the pilot to harvest. Tell us which round interests
                you and we will send the budget, the evidence and the open
                questions.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="invert" className="px-6 py-3">
                  Enquire about a round
                  <ArrowRight />
                </ButtonLink>
                <Link
                  href="/invest"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-text-inverted transition-colors hover:border-white/50"
                >
                  How investing works
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
