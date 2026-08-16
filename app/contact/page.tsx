import type { Metadata } from "next";
import { Suspense } from "react";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { PageHero } from "@/components/layout/page-hero";
import {
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { process } from "@/content/investing";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquire about a Green-X Farm investment round, equipment sponsorship or strategic partnership.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you would need to see."
        lead="Whether you are considering a full round, a tranche, equipment sponsorship or a strategic partnership, the fastest way to start is to tell us what evidence would make the decision easy."
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <SectionHeading title="Send an enquiry" />
              <div className="mt-8">
                <Suspense
                  fallback={
                    <Card className="p-9">
                      <p className="text-sm text-text-muted">Loading form…</p>
                    </Card>
                  }
                >
                  <EnquiryForm />
                </Suspense>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-7">
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  Direct contact
                </h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-text-muted">Email</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${site.email}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Phone</dt>
                    <dd className="mt-0.5 font-medium text-text-primary">
                      {site.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Headquarters</dt>
                    <dd className="mt-0.5 font-medium text-text-primary">
                      {site.headquarters}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Production sites</dt>
                    <dd className="mt-0.5 font-medium text-text-primary">
                      Koya / Masaka, Nasarawa State · Southern Kaduna
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card id="partner" className="scroll-mt-24 p-7">
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  Partnership &amp; sponsorship
                </h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  We welcome support in the form of full or partial project
                  funding, equipment and input sponsorship, strategic
                  partnership, or other structured assistance that helps a pilot
                  reach production and harvest.
                </p>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Sponsors who prefer in-kind support can fund a specific asset
                  or input line rather than cash into a general pot — equipment
                  in particular carries forward across multiple cycles.
                </p>
              </Card>

              <Card tone="sunken" className="p-7">
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  What happens next
                </h2>
                <ol className="mt-5 space-y-4">
                  {process.slice(0, 3).map((step) => (
                    <li key={step.step} className="flex gap-4">
                      <span className="font-mono text-xs text-primary">
                        {step.step}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-text-primary">
                          {step.title}
                        </span>
                        <span className="mt-0.5 block text-sm leading-7 text-text-secondary">
                          {step.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
