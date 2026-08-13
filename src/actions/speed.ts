"use server";

import { redirect } from "next/navigation";
import { isPremium, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomQuestions } from "@/lib/queries";
import { SPEED_OPTIONS, allFreeYearSets, speedOption } from "@/lib/content-rules";
import type { ExamBody } from "@/lib/types";

/**
 * Starts a timed test. We pick the questions on the server and remember which
 * ones (and their order) in a short-lived row, so the quiz page can serve them
 * without ever handing the browser the answers, and marking is done against
 * the same set.
 */
export async function startSpeedTestAction(formData: FormData) {
  const user = await requireUser();
  const premium = isPremium(user);

  const count = Number(formData.get("count") ?? 10);
  const option = speedOption(count);
  const body = (String(formData.get("body") ?? "") || undefined) as ExamBody | undefined;
  const subject = String(formData.get("subject") ?? "") || undefined;

  // Longer mocks are Premium; a free student is bounced to the paywall.
  if (option.premium && !premium) redirect("/premium");
  if (!SPEED_OPTIONS.some((o) => o.count === option.count)) redirect("/practice/speed");

  const questions = randomQuestions({
    body,
    subject,
    count: option.count,
    freeYearsBySubject: premium ? undefined : allFreeYearSets(),
  });

  if (questions.length < Math.min(5, option.count)) {
    // Not enough content for this selection yet.
    redirect("/practice/speed?tooFew=1");
  }

  const ids = questions.map((q) => q.id);
  const result = db
    .prepare(
      `INSERT INTO speed_tests (user_id, question_ids, seconds_allowed, scope_body, scope_subject)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      user.id,
      JSON.stringify(ids),
      option.count * 60,
      body ?? null,
      subject ?? null,
    );

  redirect(`/practice/speed/${Number(result.lastInsertRowid)}`);
}

export type SpeedSubmission = {
  testId: number;
  seconds: number;
  answers: Record<string, string>;
};

/**
 * Marks a Speed test against the exact questions it was built from, and records
 * it as a 'speed' attempt so it shows in history with the right label.
 */
export async function submitSpeedTestAction(payload: SpeedSubmission) {
  const user = await requireUser();

  const test = db
    .prepare(`SELECT * FROM speed_tests WHERE id = ? AND user_id = ?`)
    .get(payload.testId, user.id) as
    | {
        id: number;
        question_ids: string;
        scope_body: string | null;
        scope_subject: string | null;
        attempt_id: number | null;
      }
    | undefined;
  if (!test) redirect("/practice/speed");
  if (test.attempt_id) redirect(`/results/${test.attempt_id}`); // already marked

  const ids = JSON.parse(test.question_ids) as number[];
  const { questionsByIds, recordAttempt } = await import("@/lib/queries");
  const byId = new Map(questionsByIds(ids).map((q) => [q.id, q]));

  let score = 0;
  const answers = ids.map((id) => {
    const question = byId.get(id);
    const chosen = payload.answers[String(id)] ?? null;
    const correct = !!question && chosen === question.answer;
    if (correct) score++;
    return { questionId: id, chosen, correct };
  });

  const label = test.scope_subject
    ? `Speed · ${test.scope_subject}`
    : test.scope_body
      ? `Speed · ${test.scope_body} mixed`
      : "Speed · Mixed";

  const attemptId = recordAttempt({
    userId: user.id,
    body: test.scope_body ?? "MIX",
    subject: label,
    year: 0,
    total: ids.length,
    score,
    seconds: Math.max(0, Math.min(payload.seconds, 60 * 60 * 6)),
    mode: "speed",
    answers,
  });

  db.prepare(`UPDATE speed_tests SET attempt_id = ? WHERE id = ?`).run(attemptId, test.id);
  redirect(`/results/${attemptId}`);
}
