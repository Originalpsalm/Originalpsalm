"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2, Timer, Zap } from "lucide-react";
import { submitSpeedTestAction } from "@/actions/speed";
import { Button, cn } from "@/components/ui";
import type { QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"] as const;

export function SpeedRunner({
  testId,
  title,
  questions,
  secondsAllowed,
}: {
  testId: number;
  title: string;
  questions: QuizQuestion[];
  secondsAllowed: number;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const [remaining, setRemaining] = useState(secondsAllowed);
  const startedAt = useRef(Date.now());
  const submitted = useRef(false);

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    startTransition(() => {
      void submitSpeedTestAction({ testId, seconds, answers });
    });
  }, [answers, testId]);

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

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (confirming) return;
      const key = event.key.toUpperCase();
      if ((LETTERS as readonly string[]).includes(key)) {
        setAnswers((p) => ({ ...p, [current.id]: key }));
      } else if (event.key === "ArrowRight") setIndex((i) => Math.min(i + 1, questions.length - 1));
      else if (event.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, questions.length, confirming]);

  const clock = useMemo(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [remaining]);

  const options = [
    { letter: "A", text: current.option_a },
    { letter: "B", text: current.option_b },
    { letter: "C", text: current.option_c },
    { letter: "D", text: current.option_d },
  ];
  const lowOnTime = remaining < 30;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-gold-500/12 text-gold-400">
          <Zap size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Speed test · {title}</p>
          <p className="text-xs text-mist">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums",
            lowOnTime ? "border-red-500/35 bg-red-500/10 text-red-300" : "border-leaf-500/20 text-leaf-400",
          )}
          role="timer"
        >
          <Timer size={15} />
          {clock}
        </div>
      </header>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full brand-gradient transition-[width] duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div key={current.id} className="card animate-rise p-5 sm:p-7">
        <p className="text-lg leading-relaxed font-medium">{current.text}</p>
        <div className="mt-6 space-y-2.5">
          {options.map((option) => {
            const chosen = answers[current.id] === option.letter;
            return (
              <button
                key={option.letter}
                type="button"
                onClick={() => setAnswers((p) => ({ ...p, [current.id]: option.letter }))}
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
                    "grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
                    chosen ? "brand-gradient text-brandink" : "bg-ink-700 text-mist",
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

      <div className="mt-5 flex items-center gap-3">
        <Button variant="ghost" onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}>
          <ChevronLeft size={17} /> Back
        </Button>
        <p className="flex-1 text-center text-xs text-mist">
          {answeredCount} of {questions.length} answered
        </p>
        {index === questions.length - 1 ? (
          <Button variant="gold" onClick={() => setConfirming(true)}>
            Submit
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}>
            Next <ChevronRight size={17} />
          </Button>
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-1.5">
        {questions.map((q, position) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setIndex(position)}
            aria-label={`Question ${position + 1}`}
            className={cn(
              "size-9 rounded-lg border text-xs font-bold tabular-nums transition",
              position === index && "ring-2 ring-leaf-400 ring-offset-2 ring-offset-ink-950",
              answers[q.id] !== undefined
                ? "border-leaf-500/40 bg-leaf-500/15 text-leaf-400"
                : "border-leaf-500/12 bg-ink-900/60 text-mist",
            )}
          >
            {position + 1}
          </button>
        ))}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold">Submit your test?</h2>
            <p className="mt-2 text-sm text-mist">
              You answered {answeredCount} of {questions.length}. Unanswered questions are marked
              wrong.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirming(false)} disabled={pending}>
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

      {pending && !confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-leaf-400" />
            <p className="text-sm text-mist">Time up — marking your test…</p>
          </div>
        </div>
      )}
    </div>
  );
}
