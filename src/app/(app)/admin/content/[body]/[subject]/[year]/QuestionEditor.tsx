"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { saveQuestionAction, type ContentState } from "@/actions/content";
import { Alert, Button, Field, cn, inputClass } from "@/components/ui";

const LETTERS = ["A", "B", "C", "D"] as const;

type Question = {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  topic: string | null;
} | null;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function QuestionEditor({
  body,
  subject,
  year,
  question,
}: {
  body: string;
  subject: string;
  year: number;
  question: Question;
}) {
  const [state, action] = useActionState<ContentState, FormData>(saveQuestionAction, {});

  // Held in state so a validation error does not wipe what the admin typed.
  const [values, setValues] = useState({
    text: question?.text ?? "",
    option_a: question?.option_a ?? "",
    option_b: question?.option_b ?? "",
    option_c: question?.option_c ?? "",
    option_d: question?.option_d ?? "",
    answer: question?.answer ?? "A",
    explanation: question?.explanation ?? "",
    topic: question?.topic ?? "",
  });
  const bind = <K extends keyof typeof values>(key: K) => ({
    value: values[key] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((previous) => ({ ...previous, [key]: event.target.value })),
  });

  const errors = state.fieldErrors ?? {};
  const editing = question !== null;

  return (
    <form action={action} className="space-y-4">
      {editing && <input type="hidden" name="id" value={question.id} />}
      <input type="hidden" name="exam_body" value={body} />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="year" value={year} />

      {state.error && <Alert>{state.error}</Alert>}

      <Field label="Question" hint={errors.text}>
        <textarea
          name="text"
          required
          rows={3}
          maxLength={2000}
          placeholder="Express 0.0000275 in standard form."
          className={cn(inputClass, "resize-none", errors.text && "border-red-500/50")}
          {...bind("text")}
        />
      </Field>

      <div className="space-y-2">
        <p className="text-sm font-medium text-mist">Options — mark the correct one</p>
        {LETTERS.map((letter) => {
          const key = `option_${letter.toLowerCase()}` as keyof typeof values;
          const isCorrect = values.answer === letter;
          return (
            <label
              key={letter}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 transition",
                isCorrect
                  ? "border-leaf-500/55 bg-leaf-500/10"
                  : "border-leaf-500/12 bg-ink-900/40 hover:border-leaf-500/30",
              )}
            >
              <input
                type="radio"
                name="answer"
                value={letter}
                checked={isCorrect}
                onChange={() => setValues((previous) => ({ ...previous, answer: letter }))}
                className="mt-2 size-4 accent-[#17c471]"
              />
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-700 text-sm font-bold text-mist">
                {letter}
              </span>
              <input
                name={`option_${letter.toLowerCase()}`}
                required
                maxLength={400}
                placeholder={`Option ${letter}`}
                className={
                  inputClass +
                  " flex-1 border-0 bg-transparent px-2 py-1.5 text-sm focus:border-transparent"
                }
                {...bind(key)}
              />
            </label>
          );
        })}
      </div>

      <Field
        label="Working / explanation"
        hint="Shown on the results page. This is the part that teaches — write out the method, not just the answer."
      >
        <textarea
          name="explanation"
          rows={3}
          maxLength={2000}
          placeholder="Move the decimal 5 places right to get 2.75, so the power of ten is −5."
          className={cn(inputClass, "resize-none")}
          {...bind("explanation")}
        />
      </Field>

      <Field label="Topic (optional)">
        <input
          name="topic"
          maxLength={60}
          placeholder="Standard form"
          className={inputClass}
          {...bind("topic")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Submit label={editing ? "Save changes" : "Add question"} />
        {!editing && (
          <p className="text-xs text-mist">
            This question will appear straight away for students.
          </p>
        )}
      </div>
    </form>
  );
}
