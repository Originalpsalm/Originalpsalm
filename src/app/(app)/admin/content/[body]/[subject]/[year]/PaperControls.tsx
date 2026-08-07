"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePaperAction } from "@/actions/content";
import { Button, cn, inputClass } from "@/components/ui";

/**
 * Deleting a paper wipes every question in it. Typing the exam and year is the
 * guard — it makes a mis-click impossible.
 */
export function PaperControls({
  body,
  subject,
  year,
  questionCount,
}: {
  body: string;
  subject: string;
  year: number;
  questionCount: number;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [showing, setShowing] = useState(false);
  const key = `${body} ${year}`;

  return (
    <section className="card border-red-500/25 p-5">
      <h3 className="font-bold text-red-300">Delete this whole paper</h3>
      <p className="mt-1 text-xs text-mist">
        Removes all {questionCount} {questionCount === 1 ? "question" : "questions"} and this paper
        from students. This cannot be undone.
      </p>

      {!showing ? (
        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          onClick={() => setShowing(true)}
        >
          <Trash2 size={13} /> I want to delete the paper
        </Button>
      ) : (
        <form action={deletePaperAction} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="exam_body" value={body} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="year" value={year} />
          <label className="min-w-[220px] flex-1 text-xs text-mist">
            Type <span className="font-mono text-chalk">{key}</span> to confirm
            <input
              name="confirm"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              className={cn(
                inputClass,
                "mt-1 px-3 py-1.5 font-mono text-sm",
                confirmation && confirmation !== key && "border-red-500/40",
              )}
            />
          </label>
          <Button size="sm" variant="danger" disabled={confirmation !== key}>
            <Trash2 size={13} /> Delete paper
          </Button>
          <Button
            size="sm"
            variant="subtle"
            type="button"
            onClick={() => {
              setShowing(false);
              setConfirmation("");
            }}
          >
            Cancel
          </Button>
        </form>
      )}
    </section>
  );
}
