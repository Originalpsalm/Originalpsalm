"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { importAction, type ImportState } from "@/actions/import";
import { Alert, Button } from "@/components/ui";

const INITIAL_IMPORT: ImportState = { phase: "idle", valid: [], problems: [], groups: [] };

function ActionButton({
  intent,
  label,
  pendingLabel,
  variant,
  disabled,
}: {
  intent: "preview" | "commit";
  label: string;
  pendingLabel: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending || disabled}
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : intent === "commit" ? (
        <Upload size={15} />
      ) : (
        <FileUp size={15} />
      )}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function ImportPanel() {
  const [state, action] = useActionState<ImportState, FormData>(importAction, INITIAL_IMPORT);
  const [fileName, setFileName] = useState<string | null>(null);
  // The file's text is read on selection and carried in a controlled hidden
  // field, so it survives both the "check" and "import" submits (a file input
  // is cleared by React after the first form action).
  const [csvText, setCsvText] = useState("");

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      setCsvText("");
      return;
    }
    setFileName(file.name);
    setCsvText(await file.text());
  }

  if (state.phase === "done") {
    return (
      <div className="rounded-xl border border-leaf-500/30 bg-leaf-500/10 p-5 text-center">
        <CheckCircle2 size={26} className="mx-auto text-leaf-400" />
        <p className="mt-3 font-bold">
          Imported {state.imported} question{state.imported === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-sm text-mist">
          Across {state.papers} {state.papers === 1 ? "paper" : "papers"}. They are live for
          students now.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="/admin/content"
            className="focus-ring inline-block rounded-full brand-gradient px-5 py-2 text-sm font-semibold text-ink-950"
          >
            View content
          </a>
          <a
            href="/admin/content/import"
            className="focus-ring inline-block rounded-full border border-leaf-500/25 px-5 py-2 text-sm font-semibold hover:border-leaf-500/50"
          >
            Import another file
          </a>
        </div>
      </div>
    );
  }

  const ready = state.phase === "preview" && state.valid.length > 0;

  // One form for both steps, so the chosen file is naturally sent on both the
  // "check" and "import" submissions — nothing to stash between calls.
  return (
    <form action={action} className="space-y-4">
      {/* Controlled: carries the CSV across both submits. */}
      <input type="hidden" name="csvText" value={csvText} />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-leaf-500/25 bg-ink-900/40 p-4 transition hover:border-leaf-500/50">
        <FileUp size={20} className="shrink-0 text-mist" />
        <span className="min-w-0 flex-1 text-sm">
          {fileName ? (
            <span className="font-medium text-chalk">{fileName}</span>
          ) : (
            <>
              <span className="font-semibold text-leaf-400">Choose your CSV</span>
              <span className="text-mist"> — filled from the template</span>
            </>
          )}
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onPick}
          className="sr-only"
        />
      </label>

      {state.error && <Alert>{state.error}</Alert>}

      {state.groups.length > 0 && (
        <div className="surface p-4">
          <p className="text-sm font-semibold">You are about to add:</p>
          <ul className="mt-2 space-y-1 text-sm text-mist">
            {state.groups.map((group) => (
              <li key={group.key} className="flex justify-between gap-3">
                <span>{group.key}</span>
                <span className="font-semibold text-leaf-400 tabular-nums">+{group.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.problems.length > 0 && (
        <div className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-400">
            <AlertTriangle size={15} /> {state.problems.length} row
            {state.problems.length === 1 ? "" : "s"} will be skipped
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-mist">
            {state.problems.slice(0, 30).map((problem) => (
              <li key={problem.line}>
                <span className="font-mono">Row {problem.line}:</span> {problem.reason}
              </li>
            ))}
            {state.problems.length > 30 && <li>…and {state.problems.length - 30} more.</li>}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton
          intent="preview"
          label={state.phase === "preview" ? "Re-check file" : "Check file"}
          pendingLabel="Checking…"
          variant="ghost"
        />
        {ready && (
          <ActionButton
            intent="commit"
            label={`Import ${state.valid.length} question${state.valid.length === 1 ? "" : "s"}`}
            pendingLabel="Importing…"
          />
        )}
      </div>
    </form>
  );
}
