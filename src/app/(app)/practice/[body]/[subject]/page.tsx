import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Crown, Lock, Play } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { papersWithAccess } from "@/lib/queries";
import { freeYears } from "@/lib/content-rules";
import { isCatalogSubject } from "@/lib/catalog";
import { EXAM_BODIES, type ExamBody } from "@/lib/types";
import { Badge, ButtonLink, EmptyState } from "@/components/ui";

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
  const nFree = freeYears();
  const papers = papersWithAccess(examBody.id as ExamBody, subjectName, nFree);

  // A subject with no papers yet: if it's an official catalog subject, show a
  // friendly "coming soon" screen; only a truly unknown subject 404s.
  if (papers.length === 0) {
    if (!isCatalogSubject(examBody.id as ExamBody, subjectName)) notFound();
    return (
      <div className="space-y-6">
        <Link
          href={`/practice/${examBody.id}`}
          className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
        >
          <ArrowLeft size={15} /> {examBody.name} subjects
        </Link>
        <EmptyState
          icon={<Clock size={24} />}
          title={`${subjectName} — coming soon`}
          body={`${examBody.name} ${subjectName} questions are being added. Check back shortly — this subject will open the moment its first paper is uploaded.`}
        />
      </div>
    );
  }

  const user = await requireUser();
  const premium = isPremium(user);
  const premiumYears = papers.filter((p) => !p.is_free).length;

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

      {!premium && premiumYears > 0 && (
        <div className="surface flex flex-wrap items-center gap-3 p-4">
          <Lock size={17} className="shrink-0 text-gold-400" />
          <p className="min-w-0 flex-1 text-sm text-mist">
            The {nFree} most recent years are free. Premium opens{" "}
            <span className="font-semibold text-chalk">{premiumYears} more years</span> of this
            subject.
          </p>
          <ButtonLink href="/premium" variant="gold" size="sm">
            <Crown size={14} /> Unlock all years
          </ButtonLink>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => {
          const locked = !paper.is_free && !premium;
          const href = locked
            ? "/premium"
            : `/practice/${examBody.id}/${encodeURIComponent(subjectName)}/${paper.year}`;
          return (
            <article
              key={paper.year}
              className={
                "card flex flex-col p-5" + (locked ? " opacity-90" : "")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold">{paper.year}</p>
                  <p className="mt-0.5 text-xs text-mist">{paper.total} questions</p>
                </div>
                {paper.is_free ? (
                  <Badge tone="leaf">Free</Badge>
                ) : (
                  <Badge tone="gold">
                    <Crown size={11} /> Premium
                  </Badge>
                )}
              </div>

              {locked ? (
                <ButtonLink href="/premium" variant="gold" size="sm" className="mt-5 w-full">
                  <Lock size={14} /> Unlock with Premium
                </ButtonLink>
              ) : (
                <ButtonLink href={href} size="sm" className="mt-5 w-full">
                  <Play size={15} /> Start {paper.total}{" "}
                  {paper.total === 1 ? "question" : "questions"}
                </ButtonLink>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
