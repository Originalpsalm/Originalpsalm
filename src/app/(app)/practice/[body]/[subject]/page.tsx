import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Lock, Play } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { papersFor } from "@/lib/queries";
import { EXAM_BODIES, type ExamBody } from "@/lib/types";
import { Badge, ButtonLink } from "@/components/ui";

type Props = { params: Promise<{ body: string; subject: string }> };

export async function generateMetadata({ params }: Props) {
  const { body, subject } = await params;
  return { title: `${decodeURIComponent(subject)} — ${body.toUpperCase()}` };
}

export default async function SubjectPage({ params }: Props) {
  const { body, subject } = await params;
  const examBody = EXAM_BODIES.find((entry) => entry.id === body.toUpperCase());
  if (!examBody) notFound();

  const subjectName = decodeURIComponent(subject);
  const papers = papersFor(examBody.id as ExamBody, subjectName);
  if (papers.length === 0) notFound();

  const user = await requireUser();
  const premium = isPremium(user);

  return (
    <div className="space-y-6">
      <Link
        href={`/practice/${examBody.id}`}
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> {examBody.name} subjects
      </Link>

      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">{subjectName}</h1>
        <p className="mt-2 text-mist">
          {examBody.name} · {papers.length} {papers.length === 1 ? "paper" : "papers"} available.
          Choose a year to begin.
        </p>
      </header>

      {!premium && (
        <div className="surface flex flex-wrap items-center gap-3 p-4">
          <Lock size={17} className="shrink-0 text-gold-400" />
          <p className="min-w-0 flex-1 text-sm text-mist">
            On the free plan you attempt the first {papers[0].free_count} questions of each paper.
          </p>
          <ButtonLink href="/premium" variant="gold" size="sm">
            <Crown size={14} /> Unlock all
          </ButtonLink>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => {
          const available = premium ? paper.total : paper.free_count;
          return (
            <article key={paper.year} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold">{paper.year}</p>
                  <p className="mt-0.5 text-xs text-mist">
                    {paper.total} questions in this paper
                  </p>
                </div>
                {premium ? (
                  <Badge tone="gold">
                    <Crown size={11} /> Full
                  </Badge>
                ) : (
                  <Badge tone="mist">
                    {paper.free_count}/{paper.total} free
                  </Badge>
                )}
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full brand-gradient"
                  style={{ width: `${(available / paper.total) * 100}%` }}
                />
              </div>

              <ButtonLink
                href={`/practice/${examBody.id}/${encodeURIComponent(subjectName)}/${paper.year}`}
                size="sm"
                className="mt-5 w-full"
              >
                <Play size={15} /> Start {available} {available === 1 ? "question" : "questions"}
              </ButtonLink>
            </article>
          );
        })}
      </div>
    </div>
  );
}
