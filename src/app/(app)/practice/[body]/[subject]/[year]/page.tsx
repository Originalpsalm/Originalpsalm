import { notFound } from "next/navigation";
import { isPremium, requireUser } from "@/lib/auth";
import { questionsFor } from "@/lib/queries";
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

  const unlocked = premium ? all : all.filter((question) => question.is_premium === 0);
  const lockedCount = all.length - unlocked.length;

  // Answers and explanations are deliberately dropped here: the client only
  // ever receives the question and its options.
  const questions: QuizQuestion[] = unlocked.map(
    ({ answer: _answer, explanation: _explanation, is_premium: _isPremium, ...rest }) => rest,
  );

  return (
    <Quiz
      body={examBody.id as ExamBody}
      subject={subjectName}
      year={yearNumber}
      questions={questions}
      lockedCount={lockedCount}
    />
  );
}
