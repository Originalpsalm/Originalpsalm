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
  cropArchitecture,
  projects,
  stageLabels,
  type ProjectStage,
} from "@/content/projects";

export const metadata: Metadata = {
  title: "Project pipeline",
  description:
    "The activities Green-X Farm intends to launch — from dry-season tomato and Southern Kaduna ginger through to the Lapai flagship estate, shea and cocoa value chains, orchards, livestock and logistics.",
};

const stageTones: Record<ProjectStage, "success" | "primary" | "neutral" | "harvest"> = {
  active: "success",
  next: "primary",
  "phase-ii": "neutral",
  "phase-iii": "neutral",
  "long-term": "harvest",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Project pipeline"
        title="What we intend to launch, and what has to be true first."
        lead="Green-X will not attempt to build every crop, animal, factory and market simultaneously. Each project below carries an explicit precondition, and none of them raise capital until their economics are verified."
      >
        <ButtonLink href="/opportunities">
          See what is currently financeable
          <ArrowRight />
        </ButtonLink>
      </PageHero>

      <Section>
        <Container>
          <div className="space-y-6">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={Math.min(i * 40, 200)}>
                <Card
                  id={project.slug}
                  className="scroll-mt-24 p-7 transition-colors hover:border-primary-border sm:p-9"
                >
                  <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge tone={stageTones[project.stage]}>
                          {stageLabels[project.stage]}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {project.category}
                        </span>
                      </div>
                      <h2 className="mt-4 font-display text-2xl leading-snug font-semibold text-text-primary">
                        {project.name}
                      </h2>
                      <p className="mt-2 text-sm text-text-muted">
                        {project.location}
                      </p>
                      <p className="mt-4 text-base leading-8 text-pretty text-text-secondary">
                        {project.summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold tracking-[0.14em] text-text-muted uppercase">
                        Scope
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {project.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-3 text-sm leading-7 text-text-secondary"
                          >
                            <span
                              aria-hidden
                              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-6 rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 text-sm leading-7 text-text-secondary">
                        <span className="font-semibold text-text-primary">
                          Precondition ·{" "}
                        </span>
                        {project.precondition}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------- Crop architecture */}
      <Section tone="sunken">
        <Container>
          <SectionHeading
            eyebrow="Crop architecture"
            title="Every crop has a job"
            lead="Crops are selected for the role they play in the group — cash generation, export, aggregation, processing margin or orchard diversification — not for variety."
          />

          <Card className="mt-10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left text-sm">
                <caption className="sr-only">
                  Green-X strategic crop architecture
                </caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-sunken">
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Crop
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Primary role
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3.5 font-medium text-text-muted">
                      Indicative stage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cropArchitecture.map((row) => (
                    <tr
                      key={row.crop}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 text-left font-medium text-text-primary"
                      >
                        {row.crop}
                      </th>
                      <td className="px-6 py-4 text-text-secondary">
                        {row.role}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          tone={
                            row.priority.startsWith("Core")
                              ? "primary"
                              : row.priority === "Strategic"
                                ? "harvest"
                                : "neutral"
                          }
                        >
                          {row.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-muted">
                        {row.stage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
