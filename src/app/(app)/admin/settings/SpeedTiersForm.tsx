"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Crown, Loader2, Plus, Trash2 } from "lucide-react";
import { saveSpeedTiersAction, type SettingsState } from "@/actions/settings";
import type { SpeedTier } from "@/lib/content-constants";
import { Alert, Button, cn, inputClass } from "@/components/ui";

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? "Saving…" : "Save lengths"}
    </Button>
  );
}

export function SpeedTiersForm({ tiers }: { tiers: SpeedTier[] }) {
  const [state, action] = useActionState<SettingsState, FormData>(saveSpeedTiersAction, {});
  const [rows, setRows] = useState<SpeedTier[]>(tiers);

  function update(index: number, patch: Partial<SpeedTier>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { count: 15, minutes: 15, premium: true }]);
  }
  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="card space-y-4 p-5">
      {state.error && <Alert>{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-mist">
          <span>Questions</span>
          <span>Minutes</span>
          <span className="text-center">Premium</span>
          <span />
        </div>

        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
            {/* index-keyed premium flag, read as premium=<row index> server-side */}
            {row.premium && <input type="hidden" name="premium" value={index} />}
            <input
              name="count"
              type="number"
              min={1}
              max={200}
              required
              value={row.count}
              onChange={(e) => update(index, { count: Number(e.target.value) })}
              className={inputClass + " px-3 py-2 text-sm"}
            />
            <input
              name="minutes"
              type="number"
              min={1}
              max={300}
              required
              value={row.minutes}
              onChange={(e) => update(index, { minutes: Number(e.target.value) })}
              className={inputClass + " px-3 py-2 text-sm"}
            />
            <button
              type="button"
              onClick={() => update(index, { premium: !row.premium })}
              aria-pressed={row.premium}
              aria-label={row.premium ? "Premium length" : "Free length"}
              className={cn(
                "focus-ring grid size-10 place-items-center rounded-lg border transition",
                row.premium
                  ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
                  : "border-leaf-500/25 bg-leaf-500/10 text-leaf-400",
              )}
              title={row.premium ? "Premium — tap to make free" : "Free — tap to make premium"}
            >
              {row.premium ? <Crown size={15} /> : "Free"}
            </button>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              aria-label="Remove length"
              className="focus-ring grid size-10 place-items-center rounded-lg text-mist transition hover:text-red-300 disabled:opacity-40"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-leaf-500/20 px-3.5 py-1.5 text-xs font-semibold hover:border-leaf-500/45"
      >
        <Plus size={13} /> Add a length
      </button>

      <div className="flex items-center gap-3 border-t border-leaf-500/10 pt-3">
        <Save />
        <p className="text-xs text-mist">Keep at least one free length.</p>
      </div>
    </form>
  );
}
