"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCsv } from "@/lib/csv";
import { nextQuestionNumber, recordAction } from "@/lib/admin";

/** The columns we accept, in any order, matched case-insensitively. */
const FIELDS = [
  "exam_body",
  "subject",
  "year",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "answer",
  "explanation",
  "topic",
] as const;

type Field = (typeof FIELDS)[number];

const BODIES = new Set(["WAEC", "JAMB", "NECO", "NABTEB"]);
const LETTERS = new Set(["A", "B", "C", "D"]);

export type ImportRow = {
  line: number;
  exam_body: string;
  subject: string;
  year: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  explanation: string;
  topic: string;
};

export type ImportState = {
  phase: "idle" | "preview" | "done";
  error?: string;
  valid: ImportRow[];
  problems: { line: number; reason: string }[];
  groups: { key: string; count: number }[];
  imported?: number;
  papers?: number;
};

// NOTE: a "use server" module may only export async functions, so the initial
// state constant lives in the client component, not here.

/** Column-header aliases, so a slightly different spreadsheet still lines up. */
const ALIASES: Record<string, Field> = {
  exam: "exam_body",
  exam_body: "exam_body",
  body: "exam_body",
  examboard: "exam_body",
  exam_board: "exam_body",
  subject: "subject",
  year: "year",
  question: "question",
  question_text: "question",
  text: "question",
  a: "option_a",
  option_a: "option_a",
  b: "option_b",
  option_b: "option_b",
  c: "option_c",
  option_c: "option_c",
  d: "option_d",
  option_d: "option_d",
  answer: "answer",
  correct: "answer",
  correct_answer: "answer",
  explanation: "explanation",
  working: "explanation",
  solution: "explanation",
  topic: "topic",
};

function normaliseHeader(raw: string): Field | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  return ALIASES[key] ?? null;
}

type Parsed = {
  ok: boolean;
  error?: string;
  valid: ImportRow[];
  problems: { line: number; reason: string }[];
  groups: { key: string; count: number }[];
};

/** Parses and validates a CSV file without writing anything. */
async function validate(text: string): Promise<Parsed> {
  const base: Parsed = { ok: false, valid: [], problems: [], groups: [] };

  if (text.length > 8_000_000) {
    return { ...base, error: "That file is too large. Split it into smaller batches." };
  }

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { ...base, error: "The file has a header row but no questions." };
  }

  const header = rows[0].map(normaliseHeader);
  const required: Field[] = [
    "exam_body",
    "subject",
    "year",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "answer",
  ];
  const missing = required.filter((f) => !header.includes(f));
  if (missing.length) {
    return {
      ...base,
      error: `Your file is missing these columns: ${missing.join(", ")}. Download the template for the exact headings.`,
    };
  }

  const index = (field: Field) => header.indexOf(field);
  const valid: ImportRow[] = [];
  const problems: { line: number; reason: string }[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const line = r + 1;
    const get = (field: Field) => (index(field) >= 0 ? (cells[index(field)] ?? "").trim() : "");

    const exam = get("exam_body").toUpperCase();
    const subject = get("subject");
    const yearRaw = get("year");
    const question = get("question");
    const answer = get("answer").toUpperCase();
    const options = {
      option_a: get("option_a"),
      option_b: get("option_b"),
      option_c: get("option_c"),
      option_d: get("option_d"),
    };

    if (!BODIES.has(exam)) {
      problems.push({ line, reason: `Exam "${get("exam_body")}" must be WAEC, JAMB, NECO or NABTEB.` });
      continue;
    }
    if (!subject) {
      problems.push({ line, reason: "Subject is empty." });
      continue;
    }
    const year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1990 || year > 2100) {
      problems.push({ line, reason: `Year "${yearRaw}" is not a sensible year.` });
      continue;
    }
    if (question.length < 3) {
      problems.push({ line, reason: "Question text is empty or too short." });
      continue;
    }
    if (!options.option_a || !options.option_b || !options.option_c || !options.option_d) {
      problems.push({ line, reason: "All four options (A–D) must be filled." });
      continue;
    }
    if (!LETTERS.has(answer)) {
      problems.push({ line, reason: `Answer "${get("answer")}" must be A, B, C or D.` });
      continue;
    }

    valid.push({ line, exam_body: exam, subject, year, question, ...options, answer, explanation: get("explanation"), topic: get("topic") });
  }

  const groupMap = new Map<string, number>();
  for (const row of valid) {
    const key = `${row.exam_body} · ${row.subject} · ${row.year}`;
    groupMap.set(key, (groupMap.get(key) ?? 0) + 1);
  }

  return {
    ok: valid.length > 0,
    valid,
    problems,
    groups: [...groupMap.entries()].map(([key, count]) => ({ key, count })),
    error: valid.length === 0 ? "No valid questions were found in the file." : undefined,
  };
}

/**
 * One action drives both steps. The file rides in the same form for both
 * "check" and "import", so nothing has to be stashed between calls. Import
 * re-validates the file server-side rather than trusting the preview, and
 * writes in a single transaction so a failure leaves nothing half-imported.
 */
export async function importAction(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const actor = await requireAdmin();
  const intent = String(formData.get("intent") ?? "preview");

  // The CSV text is carried in a controlled hidden field, not a file input:
  // React 19 clears an uncontrolled file input after the first form action, so
  // the file would be gone by the "commit" submit. Text in state survives both.
  const text = String(formData.get("csvText") ?? "");

  if (!text.trim()) {
    return {
      phase: "idle",
      valid: [],
      problems: [],
      groups: [],
      error: "Choose a CSV file to upload.",
    };
  }

  const parsed = await validate(text);

  if (intent !== "commit" || !parsed.ok) {
    return {
      phase: "preview",
      error: parsed.error,
      valid: parsed.valid,
      problems: parsed.problems,
      groups: parsed.groups,
    };
  }

  const insert = db.prepare(
    `INSERT INTO questions
        (exam_body, subject, year, number, text, option_a, option_b, option_c,
         option_d, answer, explanation, topic, is_premium)
      VALUES (@exam_body, @subject, @year, @number, @text, @option_a, @option_b,
              @option_c, @option_d, @answer, @explanation, @topic, 0)`,
  );

  const counters = new Map<string, number>();
  const run = db.transaction(() => {
    for (const row of parsed.valid) {
      const key = `${row.exam_body}|${row.subject}|${row.year}`;
      const number =
        counters.get(key) ??
        nextQuestionNumber({ exam_body: row.exam_body, subject: row.subject, year: row.year });
      counters.set(key, number + 1);
      insert.run({
        exam_body: row.exam_body,
        subject: row.subject,
        year: row.year,
        number,
        text: row.question,
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        answer: row.answer,
        explanation: row.explanation || null,
        topic: row.topic || null,
      });
    }
  });
  run();

  recordAction({
    actorId: actor.id,
    action: "questions.import",
    targetType: "content",
    targetLabel: `${parsed.valid.length} questions`,
    detail: parsed.groups.map((g) => `${g.key} (${g.count})`).join("; ").slice(0, 200),
  });

  revalidatePath("/admin/content");
  revalidatePath("/practice");

  return {
    phase: "done",
    valid: [],
    problems: parsed.problems,
    groups: [],
    imported: parsed.valid.length,
    papers: parsed.groups.length,
  };
}
