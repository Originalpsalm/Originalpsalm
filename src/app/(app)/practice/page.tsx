import Link from "next/link";
import { ArrowRight, BookOpenCheck, Timer, Zap } from "lucide-react";
import { subjectsWithCatalog } from "@/lib/queries";
import { EXAM_BODIES } from "@/lib/types";
import { Badge } from "@/components/ui";

export const metadata = { title: "Practice" };

export default function PracticePage() {
  const bodies = EXAM_BODIES.map((body) => {
    const all = subjectsWithCatalog(body.id);
    return { ...body, subjects: all.filter((s) => !s.comingSoon), catalogCount: all.length };
  });

  return (
    <div className="space-y-8">
      <header className="animate-rise">
        <h1 className="text-3xl font-extrabold tracking-tight">Past questions</h1>
        <p className="mt-2 text-mist">
          Pick an exam body, then a subject, then the year you want to attempt.
        </p>
      </header>

      {/* Speed Mode — the timed, addictive way to practise. */}
      <Link
        href="/practice/speed"
        className="focus-ring card group flex items-center gap-4 overflow-hidden p-5 transition hover:border-gold-500/40"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-400">
          <Zap size={24} strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">Speed Mode</h2>
            <Badge tone="gold">
              <Timer size={11} /> Timed
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-mist">
            A random mix under the clock — pick 10, 20 or 40 and test your exam-day speed.
          </p>
        </div>
        <ArrowRight
          size={18}
          className="shrink-0 text-mist transition group-hover:translate-x-0.5 group-hover:text-gold-400"
        />
      </Link>

      {bodies.map((body) => (
        <section key={body.id}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-bold text-leaf-400">{body.name}</h2>
            <Badge tone="mist">{body.catalogCount} subjects</Badge>
            <Link
              href={`/practice/${body.id}`}
              className="focus-ring ml-auto rounded text-sm text-mist hover:text-chalk"
            >
              View all
            </Link>
          </div>

          {body.subjects.length === 0 ? (
            <Link
              href={`/practice/${body.id}`}
              className="focus-ring surface flex items-center gap-3 px-4 py-6 text-sm text-mist transition hover:text-chalk"
            >
              <BookOpenCheck size={18} className="shrink-0 text-mist" />
              <span>
                {body.catalogCount} {body.name} subjects listed — questions are being added. Tap to
                see the full list.
              </span>
              <ArrowRight size={16} className="ml-auto shrink-0" />
            </Link>
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
