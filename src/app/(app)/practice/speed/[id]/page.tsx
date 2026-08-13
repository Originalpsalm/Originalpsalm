import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionsByIds } from "@/lib/queries";
import type { QuizQuestion } from "@/lib/types";
import { SpeedRunner } from "./SpeedRunner";

export const metadata = { title: "Speed test" };

type Props = { params: Promise<{ id: string }> };

export default async function SpeedRunPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();

  const test = db
    .prepare(`SELECT * FROM speed_tests WHERE id = ? AND user_id = ?`)
    .get(Number(id), user.id) as
    | {
        id: number;
        question_ids: string;
        seconds_allowed: number;
        scope_subject: string | null;
        scope_body: string | null;
        attempt_id: number | null;
      }
    | undefined;
  if (!test) notFound();
  if (test.attempt_id) redirect(`/results/${test.attempt_id}`);

  const ids = JSON.parse(test.question_ids) as number[];
  const byId = new Map(questionsByIds(ids).map((q) => [q.id, q]));

  // Preserve the stored order, and strip answers before sending to the client.
  const questions: QuizQuestion[] = ids
    .map((qid) => byId.get(qid))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map(({ answer: _a, explanation: _e, is_premium: _p, ...rest }) => rest);

  const title = test.scope_subject
    ? test.scope_subject
    : test.scope_body
      ? `${test.scope_body} — mixed`
      : "Mixed";

  return (
    <SpeedRunner
      testId={test.id}
      title={title}
      questions={questions}
      secondsAllowed={test.seconds_allowed}
    />
  );
}
