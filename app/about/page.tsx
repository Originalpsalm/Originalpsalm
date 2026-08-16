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
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  founders,
  governance,
  impact,
  riskFramework,
  story,
} from "@/content/about";
import { locations, philosophy } from "@/content/site";

export const metadata: Metadata = {
  title: "About Green-X",
  description:
    "Who is behind Green-X Farm — the founders, the setback that reshaped the plan, the 50/50 governance structure, the operating philosophy and the risk framework.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Green-X"
        title="Two founders, one hectare, and a plan that survives contact with reality."
        lead="Green-X Farm is a youth-led Nigerian agribusiness with a long-term objective of developing an integrated agricultural production, aggregation, processing, distribution and export enterprise — built from profitable operations rather than from borrowed ambition."
      />

      {/* --------------------------------------------------------- Story */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Our story"
            title="Rebuilding after an unexpected setback"
          />

          <div className="mt-12 grid gap-x-14 gap-y-10 lg:grid-cols-2">
            {story.map((chapter, i) => (
              <Reveal key={chapter.heading} delay={i * 70}>
                <div className="border-t-2 border-primary/25 pt-5">
                  <h3 className="font-display text-xl leading-snug font-semibold text-text-primary">
                    {chapter.heading}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-pretty text-text-secondary">
                    {chapter.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ Founders */}
      <Section tone="sunken" id="founders">
        <Container>
          <SectionHeading
            eyebrow="Founders"
            title="Hands-on, in the field"
            lead="During dry-season tomato production one founder maintains close oversight of Masaka while the other prepares the next Southern Kaduna ginger cycle. This seasonal rotation means the next operation is prepared before the current one ends."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {founders.map((founder, i) => (
              <Reveal key={founder.focus} delay={i * 80}>
                <Card className="h-full p-7 sm:p-8">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-semibold text-primary-fg">
                      {founder.initials}
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-text-primary">
                        {founder.role}
                      </p>
                      <p className="text-sm text-text-muted">{founder.focus}</p>
                    </div>
                  </div>

                  <ul className="mt-7 space-y-3 border-t border-border-subtle pt-6">
                    {founder.responsibilities.map((responsibility) => (
                      <li
                        key={responsibility}
                        className="flex gap-3 text-sm leading-7 text-text-secondary"
                      >
                        <span
                          aria-hidden
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>

          <Card tone="sunken" className="mt-6 border-dashed p-6 sm:p-7">
            <p className="text-sm leading-7 text-text-secondary">
              <span className="font-medium text-text-primary">
                Supporting team ·{" "}
              </span>
              Experienced tomato growers already known to the founders handle
              day-to-day technical field management. External specialists are
              engaged for agronomy, accounting, legal, engineering and export
              compliance as required, and an advisory structure develops as the
              company grows.
            </p>
          </Card>
        </Container>
      </Section>

      {/* ---------------------------------------------------- Governance */}
      <Section id="governance">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Ownership & governance"
                title="A 50/50 structure with a deadlock answer"
                lead="Neither founder takes a salary during the early capital-building stage. Fifty-fifty ownership only works if you decide in advance what happens when the two of you disagree."
              />
            </div>

            <Card className="overflow-hidden">
              <dl className="divide-y divide-border-subtle">
                {governance.map((item) => (
                  <div
                    key={item.area}
                    className="grid gap-1 px-6 py-5 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-6 sm:px-8"
                  >
                    <dt className="font-medium text-text-primary">
                      {item.area}
                    </dt>
                    <dd className="text-sm leading-7 text-text-secondary">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------- Philosophy */}
      <Section tone="invert" className="relative overflow-hidden">
        <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-40" />
        <Container className="relative">
          <SectionHeading
            tone="invert"
            eyebrow="Core business philosophy"
            title="The eight rules the business runs on"
          />

          <div className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {philosophy.map((item, i) => (
              <Reveal key={item.title} delay={i * 55}>
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
            <Reveal delay={330}>
              <div className="border-t border-white/12 pt-5">
                <h3 className="font-display text-lg font-semibold text-text-inverted">
                  Move up the value chain selectively
                </h3>
                <p className="mt-2.5 text-sm leading-7 text-text-inverted/60">
                  Processing is added only where it creates durable margin,
                  supply security or strategic control — not because it sounds
                  more impressive than farming.
                </p>
              </div>
            </Reveal>
            <Reveal delay={385}>
              <div className="border-t border-white/12 pt-5">
                <h3 className="font-display text-lg font-semibold text-text-inverted">
                  Avoid premature diversification
                </h3>
                <p className="mt-2.5 text-sm leading-7 text-text-inverted/60">
                  Every new crop, animal or facility competes for the same
                  attention and the same capital. We add them one at a time.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------- Locations */}
      <Section tone="sunken">
        <Container>
          <SectionHeading
            eyebrow="Where we operate"
            title="Location architecture"
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

      {/* --------------------------------------------------------- Risk */}
      <Section id="risk">
        <Container>
          <SectionHeading
            eyebrow="Risk framework"
            title="Every material risk has a named control"
            lead="Agriculture is not a low-risk business, and we do not present it as one. What we can control is whether each risk has been thought about before it arrives."
          />

          <Card className="mt-10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <caption className="sr-only">
                  Green-X enterprise risk framework
                </caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-sunken">
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Risk
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Control
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riskFramework.map((row) => (
                    <tr
                      key={row.risk}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <th scope="row" className="px-6 py-4 text-left align-top">
                        <Badge tone="danger">{row.risk}</Badge>
                      </th>
                      <td className="px-6 py-4 leading-7 text-text-secondary">
                        {row.control}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Impact */}
      <Section tone="sunken">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <SectionHeading
              eyebrow="Impact"
              title="What a funded cycle puts back"
              lead="A single properly capitalised hectare is not only a financial unit. It moves money through a local economy."
            />
            <ul className="space-y-4">
              {impact.map((item) => (
                <li
                  key={item}
                  className="flex gap-4 border-b border-border-subtle pb-4 text-base leading-8 text-text-secondary last:border-0"
                >
                  <span aria-hidden className="mt-1.5 text-primary">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <ButtonLink href="/opportunities">
              View investment opportunities
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact the founders
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
