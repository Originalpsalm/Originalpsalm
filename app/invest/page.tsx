import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import {
  ArrowRight,
  ButtonLink,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import {
  faqs,
  instruments,
  investorAssurances,
  process,
  reporting,
} from "@/content/investing";

export const metadata: Metadata = {
  title: "How to invest",
  description:
    "The instruments Green-X Farm accepts, the process from enquiry to cycle close-out, the reporting you receive, and honest answers to the questions investors actually ask.",
};

export default function InvestPage() {
  return (
    <>
      <PageHero
        eyebrow="How to invest"
        title="Catalytic capital, bounded rounds, records from day one."
        lead="External support is treated as catalytic rather than permanent. Once production economics are demonstrated, Green-X relies increasingly on retained earnings, strategic partnerships and carefully structured financing."
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/opportunities">
            View open rounds
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Talk to the founders
          </ButtonLink>
        </div>
      </PageHero>

      {/* --------------------------------------------------- Instruments */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Instruments"
            title="Four ways to participate"
            lead="Not every supporter wants the same exposure. Choose the structure that matches what you are actually trying to do."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {instruments.map((instrument, i) => (
              <Reveal key={instrument.name} delay={i * 70}>
                <Card className="flex h-full flex-col p-7 transition-colors hover:border-primary-border">
                  <span className="font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-text-primary">
                    {instrument.name}
                  </h3>
                  <p className="mt-3 grow text-sm leading-7 text-pretty text-text-secondary">
                    {instrument.detail}
                  </p>
                  <p className="mt-5 border-t border-border-subtle pt-4 text-sm leading-7 text-text-muted">
                    <span className="font-medium text-text-secondary">
                      Best fit:
                    </span>{" "}
                    {instrument.fit}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Process */}
      <Section tone="sunken">
        <Container>
          <SectionHeading
            eyebrow="Process"
            title="From first enquiry to cycle close-out"
            lead="Six steps. Terms are documented before any funds move, and funds are ring-fenced before any spending happens."
          />

          <ol className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((step, i) => (
              <Reveal key={step.step} delay={i * 60}>
                <li className="border-t-2 border-primary/25 pt-5">
                  <p className="font-mono text-sm font-medium text-primary">
                    {step.step}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-pretty text-text-secondary">
                    {step.detail}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------------------------------------------------- Assurances */}
      <Section tone="invert" className="relative overflow-hidden">
        <div aria-hidden className="gx-grid-bg absolute inset-0 opacity-40" />
        <Container className="relative">
          <SectionHeading
            tone="invert"
            eyebrow="What you can hold us to"
            title="Six commitments"
            lead="These are not aspirations. They are the operating rules the business already runs on."
          />

          <div className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {investorAssurances.map((item, i) => (
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
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------- Reporting */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Reporting cadence"
                title="You hear from us during the cycle, not only after it"
                lead="Green-X maintains records of expenditure and production progress and provides reasonable evidence of how supported funds are deployed."
              />
              <ButtonLink
                href="/portal"
                variant="secondary"
                className="mt-8"
              >
                Preview the investor room
                <ArrowRight />
              </ButtonLink>
            </div>

            <Card className="overflow-hidden">
              <dl className="divide-y divide-border-subtle">
                {reporting.map((item) => (
                  <div key={item.item} className="px-6 py-5 sm:px-8">
                    <dt className="flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-xs tracking-wide text-primary uppercase">
                        {item.cadence}
                      </span>
                      <span className="font-medium text-text-primary">
                        {item.item}
                      </span>
                    </dt>
                    <dd className="mt-1.5 text-sm leading-7 text-text-secondary">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- FAQ */}
      <Section tone="sunken" id="faq">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Questions"
            title="Answered honestly, including the awkward ones"
          />

          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 40}>
                <details className="group rounded-2xl border border-border-subtle bg-surface px-6 py-5 transition-colors open:border-primary-border">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left font-medium text-text-primary marker:hidden">
                    {faq.q}
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-lg leading-none text-primary transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-pretty text-text-secondary">
                    {faq.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>

          <Card className="mt-12 p-8 text-center">
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Still have a question?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-secondary">
              Ask it directly. We would rather answer a hard question before you
              commit than manage an expectation afterwards.
            </p>
            <ButtonLink href="/contact" className="mt-6">
              Contact the founders
              <ArrowRight />
            </ButtonLink>
          </Card>
        </Container>
      </Section>
    </>
  );
}
