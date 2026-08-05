"use server";

import { redirect } from "next/navigation";
import { isPremium, requireUser } from "@/lib/auth";
import { questionsByIds, recordAttempt } from "@/lib/queries";
import type { ExamBody } from "@/lib/types";

export type SubmissionPayload = {
  body: ExamBody;
  subject: string;
  year: number;
  seconds: number;
  /** questionId -> chosen letter. Missing entries count as skipped. */
  answers: Record<string, string>;
};

/**
 * Grades an attempt.
 *
 * Marking happens here against the database, never against anything the
 * browser sends — the quiz page is never given the correct letters in the
 * first place, so a student cannot read them out of the page source.
 */
export async function submitAttemptAction(payload: SubmissionPayload) {
  const user = await requireUser();
  const premium = isPremium(user);

  const ids = Object.keys(payload.answers).map(Number).filter(Number.isInteger);
  const questions = questionsByIds(ids).filter(
    (question) =>
      question.exam_body === payload.body &&
      question.subject === payload.subject &&
      question.year === payload.year &&
      // A free account's submission cannot include locked questions.
      (premium || question.is_premium === 0),
  );

  if (questions.length === 0) redirect("/practice");

  let score = 0;
  const answers = questions.map((question) => {
    const chosen = payload.answers[String(question.id)] ?? null;
    const correct = chosen === question.answer;
    if (correct) score++;
    return { questionId: question.id, chosen, correct };
  });

  const attemptId = recordAttempt({
    userId: user.id,
    body: payload.body,
    subject: payload.subject,
    year: payload.year,
    total: questions.length,
    score,
    seconds: Math.max(0, Math.min(payload.seconds, 60 * 60 * 6)),
    answers,
  });

  redirect(`/results/${attemptId}`);
}
