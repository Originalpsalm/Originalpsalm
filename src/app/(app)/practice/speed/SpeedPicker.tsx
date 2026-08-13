"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Crown, Loader2, Play } from "lucide-react";
import { startSpeedTestAction } from "@/actions/speed";
import { SPEED_OPTIONS } from "@/lib/content-constants";
import { Button, cn, inputClass } from "@/components/ui";
import type { ExamBody } from "@/lib/types";

function StartButton({ locked }: { locked: boolean }) {
  const { pending } = useFormStatus();
  if (locked) {
    return (
      <Button type="button" variant="gold" size="lg" className="w-full" disabled>
        <Crown size={16} /> Premium length — subscribe to unlock
      </Button>
    );
  }
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Play size={16} />}
      {pending ? "Building your test…" : "Start timed test"}
    </Button>
  );
}

export function SpeedPicker({
  subjects,
  premium,
}: {
  subjects: { exam_body: ExamBody; subject: string; total: number }[];
  premium: boolean;
}) {
  const [count, setCount] = useState(10);
  const [scope, setScope] = useState(""); // "" = mixed, else "BODY|Subject"

  const [body, subject] = scope ? scope.split("|") : ["", ""];
  const option = SPEED_OPTIONS.find((o) => o.count === count) ?? SPEED_OPTIONS[0];
  const locked = option.premium && !premium;

  return (
    <form action={startSpeedTestAction} className="card space-y-5 p-6">
      <input type="hidden" name="count" value={count} />
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="subject" value={subject} />

      <div>
        <p className="mb-2 text-sm font-medium text-mist">How many questions?</p>
        <div className="grid grid-cols-3 gap-2">
          {SPEED_OPTIONS.map((o) => {
            const isLocked = o.premium && !premium;
            return (
              <button
                key={o.count}
                type="button"
                onClick={() => setCount(o.count)}
                aria-pressed={count === o.count}
                className={cn(
                  "focus-ring rounded-xl border p-3 text-center transition",
                  count === o.count
                    ? "border-leaf-500/60 bg-leaf-500/12"
                    : "border-leaf-500/15 bg-ink-900/40 hover:border-leaf-500/35",
                )}
              >
                <span className="block text-lg font-extrabold tabular-nums">{o.count}</span>
                <span className="block text-[11px] text-mist">{o.label}</span>
                {isLocked && (
                  <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-gold-400">
                    <Crown size={9} /> Premium
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-mist">Subject</label>
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className={inputClass}
        >
          <option value="" className="bg-ink-900">
            Mixed — everything
          </option>
          {subjects.map((s) => (
            <option key={`${s.exam_body}|${s.subject}`} value={`${s.exam_body}|${s.subject}`} className="bg-ink-900">
              {s.exam_body} · {s.subject} ({s.total})
            </option>
          ))}
        </select>
      </div>

      <StartButton locked={locked} />

      {locked && (
        <p className="text-center text-xs text-mist">
          The 10-question quick test is free. Longer mocks are part of Premium.
        </p>
      )}
    </form>
  );
}
