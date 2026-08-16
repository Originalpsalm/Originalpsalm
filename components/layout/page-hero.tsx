import type { ReactNode } from "react";

import { Container, Eyebrow } from "@/components/ui/primitives";

/** Shared hero band used at the top of every interior page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle">
      <div aria-hidden className="gx-grid-bg absolute inset-0" />
      <div
        aria-hidden
        className="absolute -top-32 -right-24 size-96 rounded-full bg-primary/[0.08] blur-3xl"
      />
      <Container className="relative py-16 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-3xl font-display text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-2xl text-base leading-8 text-pretty text-text-secondary sm:text-lg">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
