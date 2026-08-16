import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import {
  ArrowRight,
  Badge,
  ButtonLink,
  Card,
  Container,
  Section,
  SectionHeading,
  Stat,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  capitalThreshold,
  financialDiscipline,
  fiveYearVision,
  phases,
  researchGaps,
} from "@/content/roadmap";
import { locations } from "@/content/site";

export const metadata: Metadata = {
  title: "Development roadmap",
  description:
    "Green-X Farm's phased development plan — from capital and market validation through estate establishment, processing and agro-industrial expansion, governed by a ₦400 million retained-capital threshold.",
};

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        eyebrow="Development roadmap"
        title="Each successful operating unit funds the next layer."
        lead="Production supports aggregation. Aggregation supports processing. Processing supports export. Export and distribution support industrial expansion. The group is built one proven layer at a time."
      >
        <ButtonLink href="/projects" variant="secondary">
          See the project pipeline
          <ArrowRight />
        </ButtonLink>
      </PageHero>

      {/* -------------------------------------------------------- Phases */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Phase 0 → Phase V"
            title="The development phases"
            lead="Phases are sequential and conditional. A phase does not begin because time has passed; it begins because the phase before it produced evidence."
          />

          <ol className="mt-14 space-y-0">
            {phases.map((phase, i) => (
              <Reveal key={phase.id} delay={i * 50}>
                <li className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8">
                  {i < phases.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-12 bottom-0 left-[1.4375rem] w-px bg-border-strong sm:left-[1.6875rem]"
                    />
                  ) : null}

                  <span
                    aria-hidden
                    className={
                      phase.status === "current"
                        ? "relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl bg-primary font-display text-sm font-semibold text-primary-fg ring-4 ring-primary/15 sm:size-14"
                        : "relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl border border-border-strong bg-surface font-display text-sm font-semibold text-text-muted sm:size-14"
                    }
                  >
                    {i}
                  </span>

                  <Card className="w-full p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-medium tracking-wide text-primary">
                        {phase.id}
                      </span>
                      {phase.status === "current" ? (
                        <Badge tone="success">Current phase</Badge>
                      ) : phase.status === "next" ? (
                        <Badge tone="primary">Next</Badge>
                      ) : null}
                    </div>

                    <h2 className="mt-2 font-display text-2xl leading-snug font-semibold text-text-primary">
                      {phase.name}
                    </h2>
                    <p className="mt-3 text-base leading-8 text-pretty text-text-secondary">
                      {phase.objective}
                    </p>

                    <ul className="mt-5 grid gap-3 border-t border-border-subtle pt-5 sm:grid-cols-2">
                      {phase.detail.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-sm leading-7 text-text-secondary"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --------------------------------------------- Capital threshold */}
      <Section tone="invert" className="relative overflow-hidden">
        <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-40" />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <p className="font-display text-6xl leading-none font-semibold text-primary sm:text-7xl">
                {capitalThreshold.amount}
              </p>
              <p className="mt-4 text-lg text-text-inverted/80">
                {capitalThreshold.headline}
              </p>
              <p className="mt-6 text-base leading-8 text-pretty text-text-inverted/60">
                {capitalThreshold.rationale}
              </p>
            </div>

            <ul className="space-y-4">
              {capitalThreshold.rules.map((rule, i) => (
                <Reveal key={rule} delay={i * 50}>
                  <li className="flex gap-4 border-t border-white/12 pt-4 text-sm leading-7 text-text-inverted/70">
                    <span className="font-mono text-xs text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {rule}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ Locations */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Location architecture"
            title="Where the group is being built"
            lead="Commercial coordination sits in Abuja; production and processing sit close to their supply and export corridors."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, i) => (
              <Reveal key={location.place} delay={i * 60}>
                <Card className="flex h-full flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {location.place}
                  </h3>
                  <p className="mt-3 grow text-sm leading-7 text-pretty text-text-secondary">
                    {location.role}
                  </p>
                  <p className="mt-5 border-t border-border-subtle pt-4 text-xs text-text-muted">
                    {location.position}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------- Financial discipline */}
      <Section tone="sunken">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Financial discipline"
                title="The rules that govern every naira"
              />
              <ul className="mt-8 space-y-4">
                {financialDiscipline.map((rule) => (
                  <li
                    key={rule}
                    className="flex gap-3 border-b border-border-subtle pb-4 text-sm leading-7 text-text-secondary last:border-0"
                  >
                    <span aria-hidden className="mt-1 text-primary">
                      ✓
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading
                eyebrow="Open questions"
                title="What we have not answered yet"
                lead="We publish our research gaps because a plan that claims to have no unknowns is not a plan we would invest in either."
              />
              <ul className="mt-8 space-y-3">
                {researchGaps.map((gap, i) => (
                  <li
                    key={gap}
                    className="flex gap-3 text-sm leading-7 text-text-secondary"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------- 2031 vision */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow={`Five-year vision · ${fiveYearVision.horizon}`}
            title="What a functioning Green-X looks like"
            lead={fiveYearVision.narrative}
          />

          <div className="mt-10 flex flex-wrap gap-3">
            {fiveYearVision.markers.map((marker) => (
              <Badge key={marker} tone="primary" className="px-4 py-2 text-sm">
                {marker}
              </Badge>
            ))}
          </div>

          <Card tone="sunken" className="mt-12 p-8 sm:p-10">
            <div className="grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-14">
              <Stat
                value="₦1B"
                label="Annual revenue ambition"
                detail="Strategic ambition — not a forecast"
              />
              <p className="text-base leading-8 text-pretty text-text-secondary">
                {fiveYearVision.ambition}
              </p>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
