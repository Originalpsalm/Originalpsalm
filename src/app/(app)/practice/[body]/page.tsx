import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenCheck, Clock } from "lucide-react";
import { subjectsWithCatalog } from "@/lib/queries";
import { EXAM_BODIES, type ExamBody } from "@/lib/types";
import { Badge, EmptyState } from "@/components/ui";

type Props = { params: Promise<{ body: string }> };

function resolveBody(raw: string) {
  return EXAM_BODIES.find((body) => body.id === raw.toUpperCase());
}

export async function generateMetadata({ params }: Props) {
  const { body } = await params;
  const found = resolveBody(body);
  return { title: found ? `${found.name} past questions` : "Practice" };
}

export default async function ExamBodyPage({ params }: Props) {
  const { body } = await params;
  const examBody = resolveBody(body);
  if (!examBody) notFound();

  const subjects = subjectsWithCatalog(examBody.id as ExamBody);
  const ready = subjects.filter((s) => !s.comingSoon).length;

  return (
    <div className="space-y-6">
      <Link
        href="/practice"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> All exam bodies
      </Link>

      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-leaf-400">{examBody.name}</span> past questions
        </h1>
        <p className="mt-1 text-sm uppercase tracking-wide text-mist/70">{examBody.full}</p>
        <p className="mt-3 max-w-2xl text-mist">{examBody.blurb}</p>
        <p className="mt-2 text-sm text-mist/80">
          {subjects.length} subjects · {ready} ready to practise
        </p>
      </header>

      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpenCheck size={24} />}
          title="No subjects here yet"
          body={`${examBody.name} subjects are still being set up. Try another exam body in the meantime.`}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) =>
            subject.comingSoon ? (
              <div
                key={subject.subject}
                className="card flex items-center gap-4 p-5 opacity-70"
                aria-disabled="true"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5 text-mist">
                  <BookOpenCheck size={20} strokeWidth={2.1} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-mist">{subject.subject}</p>
                  <p className="text-xs text-mist/70">No questions yet</p>
                </div>
                <Badge tone="mist">
                  <Clock size={11} /> Coming soon
                </Badge>
              </div>
            ) : (
              <Link
                key={subject.subject}
                href={`/practice/${examBody.id}/${encodeURIComponent(subject.subject)}`}
                className="focus-ring card group flex items-center gap-4 p-5 transition hover:border-leaf-500/35"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-500/10 text-leaf-400">
                  <BookOpenCheck size={20} strokeWidth={2.1} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{subject.subject}</p>
                  <p className="text-xs text-mist">
                    {subject.papers} {subject.papers === 1 ? "paper" : "papers"} · {subject.total}{" "}
                    questions
                  </p>
                </div>
                <ArrowRight
                  size={17}
                  className="shrink-0 text-mist transition group-hover:translate-x-0.5 group-hover:text-leaf-400"
                />
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
