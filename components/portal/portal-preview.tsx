"use client";

import { useState, type FormEvent } from "react";

import {
  ArrowRight,
  Badge,
  Card,
  Container,
  Notice,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import {
  portalAccess,
  portalDocuments,
  portalKpis,
  portalPositions,
  portalSummary,
  portalUpdates,
} from "@/content/portal";

/**
 * Investor room preview.
 *
 * The gate below is a front-end demonstration only — it protects nothing and
 * the code is printed on the page deliberately. A production portal needs real
 * server-side authentication and a real data source before any genuine
 * investor data goes near it.
 */
export function PortalPreview() {
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(
      new FormData(event.currentTarget).get("code") ?? "",
    ).trim();
    if (value.toUpperCase() === portalAccess.code) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!unlocked) {
    return (
      <Section>
        <Container size="narrow">
          <Card className="p-8 sm:p-10">
            <Badge tone="warning">Preview — not a live account</Badge>
            <h2 className="mt-5 font-display text-2xl font-semibold text-text-primary">
              Enter the preview code
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              {portalAccess.notice}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-wrap gap-3">
              <label className="sr-only" htmlFor="code">
                Preview access code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                autoComplete="off"
                placeholder={portalAccess.code}
                aria-invalid={error}
                aria-describedby={error ? "code-error" : undefined}
                className="min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface px-4 py-3 font-mono text-sm tracking-[0.2em] uppercase transition-colors placeholder:tracking-[0.2em] placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
              >
                Open preview
                <ArrowRight />
              </button>
            </form>

            {error ? (
              <p id="code-error" className="mt-4 text-sm text-danger-fg">
                That code is not recognised. Try{" "}
                <code className="font-mono">{portalAccess.code}</code>.
              </p>
            ) : (
              <p className="mt-4 text-sm text-text-muted">
                Code:{" "}
                <code className="font-mono font-medium text-text-primary">
                  {portalAccess.code}
                </code>{" "}
                — published deliberately, because this preview contains no real
                data.
              </p>
            )}
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section className="pb-8">
        <Container>
          <Notice tone="warning">
            <strong className="font-semibold">Illustrative figures.</strong>{" "}
            This preview demonstrates the reporting format Green-X participants
            receive. It is not a live account and the numbers below are
            examples.
          </Notice>

          <dl className="mt-10 grid gap-8 border-t border-border-subtle pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {portalSummary.map((item) => (
              <div key={item.label}>
                <dt className="text-sm text-text-muted">{item.label}</dt>
                <dd className="mt-1.5 font-display text-3xl font-semibold text-text-primary">
                  {item.value}
                </dd>
                <p className="mt-1 text-sm text-text-muted">{item.detail}</p>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* ----------------------------------------------------- Positions */}
      <Section className="py-8">
        <Container>
          <SectionHeading title="Positions" />
          <Card className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <caption className="sr-only">Investor positions</caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-sunken">
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Round
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Instrument
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Committed
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Stage
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Next report
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portalPositions.map((position) => (
                    <tr key={position.code}>
                      <th scope="row" className="px-6 py-4 text-left">
                        <span className="block font-medium text-text-primary">
                          {position.name}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          {position.code}
                        </span>
                      </th>
                      <td className="px-6 py-4 text-text-secondary">
                        {position.instrument}
                      </td>
                      <td className="px-6 py-4 font-medium tabular-nums text-text-primary">
                        {position.committed}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone="primary">{position.stage}</Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {position.nextReport}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- KPIs */}
      <Section className="py-8">
        <Container>
          <SectionHeading
            title="Cycle KPIs"
            lead="Planned against actual, updated as the cycle progresses."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portalKpis.map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">
                    {kpi.label}
                  </p>
                  <Badge tone={kpi.state === "on-track" ? "success" : "neutral"}>
                    {kpi.state === "on-track" ? "On track" : "Pending"}
                  </Badge>
                </div>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">Planned</dt>
                    <dd className="text-right text-text-secondary">
                      {kpi.planned}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">Actual</dt>
                    <dd className="text-right font-medium text-text-primary">
                      {kpi.actual}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- Updates */}
      <Section className="py-8">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div>
              <SectionHeading title="Weekly updates" />
              <ol className="mt-6 space-y-4">
                {portalUpdates.map((update) => (
                  <li key={update.week}>
                    <Card className="p-6">
                      <p className="font-mono text-xs tracking-wide text-primary uppercase">
                        {update.week}
                      </p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-text-primary">
                        {update.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-text-secondary">
                        {update.body}
                      </p>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <SectionHeading title="Document room" />
              <Card className="mt-6 overflow-hidden">
                <ul className="divide-y divide-border-subtle">
                  {portalDocuments.map((doc) => (
                    <li
                      key={doc.name}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <span>
                        <span className="block text-sm font-medium text-text-primary">
                          {doc.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {doc.type}
                        </span>
                      </span>
                      <Badge tone="neutral">{doc.updated}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
              <p className="mt-4 text-xs leading-6 text-text-muted">
                In the live portal these are downloadable files. In this preview
                they are listed to show what is kept on record.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
