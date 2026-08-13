"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/components/ui";

const PROMPT = `You are helping build a Nigerian exam-prep app. Produce past-questions as CSV.

Output ONLY a CSV (no commentary, no code fences) with EXACTLY these column headers on the first row:
exam_body,subject,year,question,option_a,option_b,option_c,option_d,answer,explanation,topic

Rules:
- exam_body must be one of: WAEC, JAMB, NECO
- answer must be a single letter: A, B, C or D (the correct option)
- explanation: show the working/reasoning, not just the answer
- topic: a short topic label (e.g. "Fractions", "Photosynthesis")
- Every question needs all four options filled
- Wrap any field containing a comma in double quotes

Give me 40 ${"{EXAM}"} ${"{SUBJECT}"} multiple-choice questions for the year ${"{YEAR}"}.
Make them realistic, exam-standard and factually correct.`;

export function AiPrompt() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked; the prompt is visible to select manually */
    }
  }

  return (
    <div className="relative mt-4">
      <pre className="max-h-64 overflow-auto rounded-xl border border-leaf-500/15 bg-ink-900/70 p-4 pr-14 text-xs leading-relaxed text-mist">
        {PROMPT}
      </pre>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "focus-ring absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
          copied
            ? "border-leaf-500/45 bg-leaf-500/10 text-leaf-400"
            : "border-leaf-500/20 bg-ink-800 text-chalk hover:border-leaf-500/45",
        )}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
