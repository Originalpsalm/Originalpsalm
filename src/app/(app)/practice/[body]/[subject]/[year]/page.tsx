import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, Lock } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { questionsFor } from "@/lib/queries";
import { isPaperFree } from "@/lib/content-rules";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { EXAM_BODIES, type ExamBody, type QuizQuestion } from "@/lib/types";
import { Quiz } from "./Quiz";

type Props = { params: Promise<{ body: string; subject: string; year: string }> };

export async function generateMetadata({ params }: Props) {
  const { body, subject, year } = await params;
  return { title: `${decodeURIComponent(subject)} ${year} — ${body.toUpperCase()}` };
}

export default async function QuizPage({ params }: Props) {
  const { body, subject, year } = await params;
  const examBody = EXAM_BODIES.find((entry) => entry.id === body.toUpperCase());
  const yearNumber = Number(year);
  if (!examBody || !Number.isInteger(yearNumber)) notFound();

  const subjectName = decodeURIComponent(subject);
  const all = questionsFor(examBody.id as ExamBody, subjectName, yearNumber);
  if (all.length === 0) notFound();

  const user = await requireUser();
  const premium = isPremium(user);
  const paperIsFree = isPaperFree(examBody.id, subjectName, yearNumber);

  // A free student on a premium (older) year is shown the upsell rather than
  // an empty paper — the whole year is behind the subscription.
  if (!paperIsFree && !premium) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="card p-8 text-center">
          <Logo size={30} className="mx-auto" />
          <div className="mx-auto mt-6 grid size-14 place-items-center rounded-2xl bg-gold-500/12 text-gold-400">
            <Lock size={24} />
          </div>
          <h1 className="mt-5 text-xl font-bold">
            {examBody.id} {subjectName} {yearNumber} is a Premium paper
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist">
            The most recent years are free for everyone. Premium opens this paper and every other
            past year — {all.length} questions here, with the full working on each one.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink href="/premium" variant="gold" size="lg">
              <Crown size={16} /> See Premium
            </ButtonLink>
            <ButtonLink
              href={`/practice/${examBody.id}/${encodeURIComponent(subjectName)}`}
              variant="ghost"
            >
              Back to free years
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  // Answers and explanations are deliberately dropped here: the client only
  // ever receives the question and its options.
  const questions: QuizQuestion[] = all.map(
    ({ answer: _answer, explanation: _explanation, is_premium: _isPremium, ...rest }) => rest,
  );

  return (
    <Quiz
      body={examBody.id as ExamBody}
      subject={subjectName}
      year={yearNumber}
      questions={questions}
      lockedCount={0}
    />
  );
}
