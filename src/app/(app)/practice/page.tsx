import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { subjectsFor } from "@/lib/queries";
import { EXAM_BODIES } from "@/lib/types";
import { Badge } from "@/components/ui";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  const bodies = EXAM_BODIES.map((body) => ({ ...body, subjects: subjectsFor(body.id) }));

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">Past questions</h1>
        <p className="mt-2 text-mist">
          Pick an exam body, then a subject, then the year you want to attempt.
        </p>
      </header>

      {bodies.map((body) => (
        <section key={body.id}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-bold text-leaf-400">{body.name}</h2>
            <Badge tone="mist">{body.subjects.length} subjects</Badge>
            <Link
              href={`/practice/${body.id}`}
              className="focus-ring ml-auto rounded text-sm text-mist hover:text-chalk"
            >
              View all
            </Link>
          </div>

          {body.subjects.length === 0 ? (
            <p className="surface px-4 py-6 text-sm text-mist">
              No papers loaded for {body.name} yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {body.subjects.map((subject) => (
                <Link
                  key={subject.subject}
                  href={`/practice/${body.id}/${encodeURIComponent(subject.subject)}`}
                  className="focus-ring card group flex items-center gap-4 p-4 transition hover:border-leaf-500/35"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-500/10 text-leaf-400">
                    <BookOpenCheck size={20} strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{subject.subject}</p>
                    <p className="text-xs text-mist">
                      {subject.papers} {subject.papers === 1 ? "paper" : "papers"} ·{" "}
                      {subject.total} questions
                    </p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="shrink-0 text-mist transition group-hover:translate-x-0.5 group-hover:text-leaf-400"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
