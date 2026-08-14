"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextQuestionNumber, recordAction } from "@/lib/admin";
import type { ExamBody } from "@/lib/types";

const bodies = ["WAEC", "JAMB", "NECO", "NABTEB"] as const;

const questionSchema = z.object({
  exam_body: z.enum(bodies),
  subject: z.string().trim().min(2).max(60),
  year: z.coerce.number().int().min(1990).max(2100),
  text: z.string().trim().min(3).max(2000),
  option_a: z.string().trim().min(1).max(400),
  option_b: z.string().trim().min(1).max(400),
  option_c: z.string().trim().min(1).max(400),
  option_d: z.string().trim().min(1).max(400),
  answer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().trim().max(2000).optional().or(z.literal("")),
  topic: z.string().trim().max(60).optional().or(z.literal("")),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof questionSchema>, string>>;

export type ContentState = {
  error?: string;
  fieldErrors?: FieldErrors;
  success?: string;
};

function pathsToRefresh(body: string, subject: string, year: number) {
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${body}/${encodeURIComponent(subject)}/${year}`);
  // The student side too — a new question should appear in practice at once.
  revalidatePath(`/practice/${body}`);
  revalidatePath(`/practice/${body}/${encodeURIComponent(subject)}`);
  revalidatePath(`/practice/${body}/${encodeURIComponent(subject)}/${year}`);
}

export async function saveQuestionAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const actor = await requireAdmin();
  const editingId = Number(formData.get("id") ?? 0) || null;
  const parsed = questionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FieldErrors | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;
  if (editingId) {
    const existing = db
      .prepare(`SELECT exam_body, subject, year FROM questions WHERE id = ?`)
      .get(editingId) as { exam_body: string; subject: string; year: number } | undefined;
    if (!existing) return { error: "That question no longer exists." };

    db.prepare(
      `UPDATE questions
          SET text = @text,
              option_a = @option_a, option_b = @option_b,
              option_c = @option_c, option_d = @option_d,
              answer = @answer,
              explanation = @explanation,
              topic = @topic
        WHERE id = @id`,
    ).run({
      id: editingId,
      text: input.text,
      option_a: input.option_a,
      option_b: input.option_b,
      option_c: input.option_c,
      option_d: input.option_d,
      answer: input.answer,
      explanation: input.explanation || null,
      topic: input.topic || null,
    });

    recordAction({
      actorId: actor.id,
      action: "question.edit",
      targetType: "question",
      targetId: editingId,
      targetLabel: `${existing.exam_body} ${existing.subject} ${existing.year}`,
      detail: input.text.slice(0, 120),
    });
    pathsToRefresh(existing.exam_body, existing.subject, existing.year);
    redirect(
      `/admin/content/${existing.exam_body}/${encodeURIComponent(existing.subject)}/${existing.year}`,
    );
  }

  const number = nextQuestionNumber({
    exam_body: input.exam_body,
    subject: input.subject,
    year: input.year,
  });

  const result = db
    .prepare(
      `INSERT INTO questions
          (exam_body, subject, year, number, text, option_a, option_b, option_c,
           option_d, answer, explanation, topic, is_premium)
        VALUES (@exam_body, @subject, @year, @number, @text, @option_a, @option_b,
                @option_c, @option_d, @answer, @explanation, @topic, 0)`,
    )
    .run({
      exam_body: input.exam_body,
      subject: input.subject,
      year: input.year,
      number,
      text: input.text,
      option_a: input.option_a,
      option_b: input.option_b,
      option_c: input.option_c,
      option_d: input.option_d,
      answer: input.answer,
      explanation: input.explanation || null,
      topic: input.topic || null,
    });

  recordAction({
    actorId: actor.id,
    action: "question.add",
    targetType: "question",
    targetId: Number(result.lastInsertRowid),
    targetLabel: `${input.exam_body} ${input.subject} ${input.year}`,
    detail: input.text.slice(0, 120),
  });
  pathsToRefresh(input.exam_body, input.subject, input.year);
  redirect(
    `/admin/content/${input.exam_body}/${encodeURIComponent(input.subject)}/${input.year}?added=1`,
  );
}

export async function deleteQuestionAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("id"));
  const question = db
    .prepare(`SELECT id, exam_body, subject, year, text FROM questions WHERE id = ?`)
    .get(id) as
    | { id: number; exam_body: string; subject: string; year: number; text: string }
    | undefined;
  if (!question) redirect("/admin/content");

  db.prepare(`DELETE FROM questions WHERE id = ?`).run(question.id);

  // Numbers are contiguous — after a delete, shift everything above it down.
  db.prepare(
    `UPDATE questions SET number = number - 1
      WHERE exam_body = ? AND subject = ? AND year = ? AND number > (
        SELECT COALESCE(MIN(number), 0) - 1 FROM questions
         WHERE exam_body = ? AND subject = ? AND year = ?
      )`,
  ).run(
    question.exam_body,
    question.subject,
    question.year,
    question.exam_body,
    question.subject,
    question.year,
  );

  recordAction({
    actorId: actor.id,
    action: "question.delete",
    targetType: "question",
    targetId: question.id,
    targetLabel: `${question.exam_body} ${question.subject} ${question.year}`,
    detail: question.text.slice(0, 120),
  });
  pathsToRefresh(question.exam_body, question.subject, question.year);
  redirect(
    `/admin/content/${question.exam_body}/${encodeURIComponent(question.subject)}/${question.year}`,
  );
}

const paperSchema = z.object({
  exam_body: z.enum(bodies),
  subject: z.string().trim().min(2, "Enter a subject.").max(60),
  year: z.coerce.number().int().min(1990).max(2100),
});

export async function createPaperAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const actor = await requireAdmin();
  const parsed = paperSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { exam_body, subject, year } = parsed.data;

  // Papers exist as soon as they hold a question, so this is really "the
  // shell exists" — a redirect that lets the admin add the first question.
  recordAction({
    actorId: actor.id,
    action: "paper.create",
    targetType: "paper",
    targetLabel: `${exam_body} ${subject} ${year}`,
  });
  redirect(
    `/admin/content/${exam_body}/${encodeURIComponent(subject)}/${year}?added=0#new`,
  );
}

export async function deletePaperAction(formData: FormData) {
  const actor = await requireAdmin();
  const exam_body = String(formData.get("exam_body") ?? "") as ExamBody;
  const subject = String(formData.get("subject") ?? "");
  const year = Number(formData.get("year"));
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (confirm !== `${exam_body} ${year}`) redirect("/admin/content?error=confirm");

  const removed = db
    .prepare(
      `DELETE FROM questions WHERE exam_body = ? AND subject = ? AND year = ?`,
    )
    .run(exam_body, subject, year);

  recordAction({
    actorId: actor.id,
    action: "paper.delete",
    targetType: "paper",
    targetLabel: `${exam_body} ${subject} ${year}`,
    detail: `${removed.changes} question${removed.changes === 1 ? "" : "s"} removed`,
  });
  pathsToRefresh(exam_body, subject, year);
  redirect("/admin/content");
}
