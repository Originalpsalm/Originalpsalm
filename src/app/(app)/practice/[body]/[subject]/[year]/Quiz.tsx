"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Flag,
  Loader2,
  Lock,
  Timer,
  X,
} from "lucide-react";
import { submitAttemptAction } from "@/actions/practice";
import { Button, ButtonLink, cn } from "@/components/ui";
import type { ExamBody, QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"] as const;
/** JAMB allows roughly this much time per question; we use it for every paper. */
const SECONDS_PER_QUESTION = 72;

export function Quiz({
  body,
  subject,
  year,
  questions,
  lockedCount,
}: {
  body: ExamBody;
  subject: string;
  year: number;
  questions: QuizQuestion[];
  lockedCount: number;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const allowance = questions.length * SECONDS_PER_QUESTION;
  const [remaining, setRemaining] = useState(allowance);
  const startedAt = useRef(Date.now());
  const submitted = useRef(false);

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    startTransition(() => {
      void submitAttemptAction({ body, subject, year, seconds, answers });
    });
  }, [answers, body, subject, year]);

  // Countdown. Submitting on zero mirrors what CBT does at the centre.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          submit();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submit]);

  // Keyboard: A–D to answer, arrows to move. Makes desktop revision quick.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (confirming) return;
      const key = event.key.toUpperCase();
      if ((LETTERS as readonly string[]).includes(key)) {
        setAnswers((previous) => ({ ...previous, [current.id]: key }));
      } else if (event.key === "ArrowRight") {
        setIndex((i) => Math.min(i + 1, questions.length - 1));
      } else if (event.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, questions.length, confirming]);

  const clock = useMemo(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [remaining]);

  const options = [
    { letter: "A", text: current.option_a },
    { letter: "B", text: current.option_b },
    { letter: "C", text: current.option_c },
    { letter: "D", text: current.option_d },
  ];

  function toggleFlag() {
    setFlagged((previous) => {
      const next = new Set(previous);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  }

  const lowOnTime = remaining < 60;

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------------------------------------------------------- head --- */}
      <header className="mb-5 flex items-center gap-3">
        <Link
          href={`/practice/${body}/${encodeURIComponent(subject)}`}
          className="focus-ring grid size-9 shrink-0 place-items-center rounded-full border border-leaf-500/15 text-mist transition hover:text-chalk"
          aria-label="Leave this paper"
        >
          <X size={17} />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subject}</p>
          <p className="truncate text-xs text-mist">
            {body} {year} · question {index + 1} of {questions.length}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums transition",
            lowOnTime
              ? "border-red-500/35 bg-red-500/10 text-red-300"
              : "border-leaf-500/20 text-leaf-400",
          )}
          role="timer"
          aria-live="off"
        >
          <Timer size={15} />
          {clock}
        </div>
      </header>

      {/* ------------------------------------------------------ progress --- */}
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full brand-gradient transition-[width] duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ------------------------------------------------------ question --- */}
      <div key={current.id} className="card animate-rise p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="text-lg leading-relaxed font-medium">{current.text}</p>
          <button
            type="button"
            onClick={toggleFlag}
            className={cn(
              "focus-ring grid size-9 shrink-0 place-items-center rounded-full border transition",
              flagged.has(current.id)
                ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
                : "border-leaf-500/15 text-mist hover:text-chalk",
            )}
            aria-label={flagged.has(current.id) ? "Remove flag" : "Flag for review"}
            aria-pressed={flagged.has(current.id)}
          >
            <Flag size={15} />
          </button>
        </div>

        <div className="mt-6 space-y-2.5">
          {options.map((option) => {
            const chosen = answers[current.id] === option.letter;
            return (
              <button
                key={option.letter}
                type="button"
                onClick={() =>
                  setAnswers((previous) => ({ ...previous, [current.id]: option.letter }))
                }
                aria-pressed={chosen}
                className={cn(
                  "focus-ring flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition",
                  chosen
                    ? "border-leaf-500/60 bg-leaf-500/12"
                    : "border-leaf-500/12 bg-ink-900/40 hover:border-leaf-500/30 hover:bg-ink-800/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition",
                    chosen ? "brand-gradient text-ink-950" : "bg-ink-700 text-mist",
                  )}
                >
                  {option.letter}
                </span>
                <span className="text-[0.95rem] leading-snug">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------- nav row --- */}
      <div className="mt-5 flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
        >
          <ChevronLeft size={17} /> Back
        </Button>

        <p className="flex-1 text-center text-xs text-mist">
          {answeredCount} of {questions.length} answered
        </p>

        {index === questions.length - 1 ? (
          <Button variant="gold" onClick={() => setConfirming(true)}>
            Submit paper
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}>
            Next <ChevronRight size={17} />
          </Button>
        )}
      </div>

      {/* -------------------------------------------------- question map --- */}
      <div className="mt-7">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-mist">
          Question map
        </p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((question, position) => {
            const isAnswered = answers[question.id] !== undefined;
            const isFlagged = flagged.has(question.id);
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Go to question ${position + 1}`}
                aria-current={position === index ? "true" : undefined}
                className={cn(
                  "focus-ring size-9 rounded-lg border text-xs font-bold tabular-nums transition",
                  position === index && "ring-2 ring-leaf-400 ring-offset-2 ring-offset-ink-950",
                  isFlagged
                    ? "border-gold-500/45 bg-gold-500/15 text-gold-400"
                    : isAnswered
                      ? "border-leaf-500/40 bg-leaf-500/15 text-leaf-400"
                      : "border-leaf-500/12 bg-ink-900/60 text-mist",
                )}
              >
                {position + 1}
              </button>
            );
          })}

          {/* Locked questions are shown, not hidden — a free user should see
              exactly what they are missing. */}
          {Array.from({ length: lockedCount }).map((_, position) => (
            <span
              key={`locked-${position}`}
              className="grid size-9 place-items-center rounded-lg border border-gold-500/20 bg-gold-500/5 text-gold-500/60"
              title="Premium question"
            >
              <Lock size={13} />
            </span>
          ))}
        </div>
      </div>

      {lockedCount > 0 && (
        <div className="surface mt-5 flex flex-wrap items-center gap-3 p-4">
          <Lock size={17} className="shrink-0 text-gold-400" />
          <p className="min-w-0 flex-1 text-sm text-mist">
            <span className="font-semibold text-chalk">{lockedCount} more questions</span> in this
            paper are part of Premium.
          </p>
          <ButtonLink href="/premium" variant="gold" size="sm">
            <Crown size={14} /> Unlock
          </ButtonLink>
        </div>
      )}

      {/* --------------------------------------------------- submit modal --- */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-heading"
        >
          <div className="card w-full max-w-sm p-6 text-center">
            <h2 id="submit-heading" className="text-lg font-bold">
              Submit this paper?
            </h2>
            <p className="mt-2 text-sm text-mist">
              You answered{" "}
              <span className="font-semibold text-chalk">
                {answeredCount} of {questions.length}
              </span>
              . {answeredCount < questions.length && "Unanswered questions are marked wrong. "}
              You will see the correct answer and the working for every question.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                Keep going
              </Button>
              <Button variant="gold" className="flex-1" onClick={submit} disabled={pending}>
                {pending ? <Loader2 size={16} className="animate-spin" /> : null}
                {pending ? "Marking…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen state while the timer runs out and marking happens. */}
      {pending && !confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-leaf-400" />
            <p className="text-sm text-mist">Time up — marking your paper…</p>
          </div>
        </div>
      )}
    </div>
  );
}
