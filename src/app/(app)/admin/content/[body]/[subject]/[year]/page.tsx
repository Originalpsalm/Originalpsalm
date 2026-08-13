import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { paperQuestions } from "@/lib/admin";
import { isPaperFree } from "@/lib/content-rules";
import { deleteQuestionAction } from "@/actions/content";
import { Alert, Badge, Button, cn } from "@/components/ui";
import { EXAM_BODIES } from "@/lib/types";
import { QuestionEditor } from "./QuestionEditor";
import { PaperControls } from "./PaperControls";

type Props = {
  params: Promise<{ body: string; subject: string; year: string }>;
  searchParams: Promise<{ edit?: string; added?: string }>;
};

export const metadata = { title: "Edit paper" };

export default async function EditPaperPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { body, subject, year } = await params;
  const { edit, added } = await searchParams;

  const examBody = EXAM_BODIES.find((entry) => entry.id === body.toUpperCase());
  const yearNumber = Number(year);
  if (!examBody || !Number.isInteger(yearNumber)) notFound();

  const subjectName = decodeURIComponent(subject);
  const questions = paperQuestions({
    exam_body: examBody.id,
    subject: subjectName,
    year: yearNumber,
  });

  const editingId = Number(edit);
  const editing = editingId ? questions.find((q) => q.id === editingId) : null;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/content"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> All papers
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold tracking-tight">
            {subjectName}{" "}
            <span className="text-mist font-normal">
              · {examBody.id} {yearNumber}
            </span>
          </h2>
          <p className="text-xs text-mist">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </p>
        </div>
        {isPaperFree(examBody.id, subjectName, yearNumber) ? (
          <Badge tone="leaf">Free year</Badge>
        ) : (
          <Badge tone="gold">Premium year</Badge>
        )}
      </header>

      {added === "1" && (
        <Alert tone="success">Question saved. It is live for students right now.</Alert>
      )}

      {/* ------------------------------------------------------- editor --- */}
      <section id="new" className="card p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold">
          <Pencil size={16} className="text-leaf-400" />
          {editing ? `Editing question ${editing.number}` : "Add a question"}
        </h3>

        <QuestionEditor
          key={editing?.id ?? "new"}
          body={examBody.id}
          subject={subjectName}
          year={yearNumber}
          question={editing ?? null}
        />

        {editing && (
          <p className="mt-3 text-xs text-mist">
            <Link
              href={`/admin/content/${examBody.id}/${encodeURIComponent(subjectName)}/${yearNumber}#new`}
              className="focus-ring rounded text-leaf-400 hover:underline"
            >
              Cancel editing and add a new one
            </Link>
          </p>
        )}
      </section>

      {/* ---------------------------------------------------- question list --- */}
      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-mist">
          Questions in this paper
        </h3>

        {questions.length === 0 ? (
          <p className="card px-5 py-10 text-center text-sm text-mist">
            No questions yet. The form above adds the first one.
          </p>
        ) : (
          <ol className="space-y-2">
            {questions.map((question) => {
              const isEditing = question.id === editingId;
              return (
                <li
                  key={question.id}
                  className={cn(
                    "card p-4",
                    isEditing && "border-leaf-400/60",
                  )}
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-leaf-500/12 text-xs font-bold text-leaf-400 tabular-nums">
                      {question.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed">{question.text}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-mist">
                        <Badge tone="leaf">Answer {question.answer}</Badge>
                        {question.topic && <Badge tone="mist">{question.topic}</Badge>}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Link
                        href={`/admin/content/${examBody.id}/${encodeURIComponent(subjectName)}/${yearNumber}?edit=${question.id}#new`}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-leaf-500/20 px-3 py-1.5 text-xs font-semibold hover:border-leaf-500/45"
                      >
                        <Pencil size={13} /> Edit
                      </Link>

                      <form action={deleteQuestionAction}>
                        <input type="hidden" name="id" value={question.id} />
                        <Button size="sm" variant="danger" aria-label="Delete question">
                          <Trash2 size={13} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* ---------------------------------------------- delete whole paper --- */}
      <PaperControls
        body={examBody.id}
        subject={subjectName}
        year={yearNumber}
        questionCount={questions.length}
      />
    </div>
  );
}
