"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { saveSettingsAction, type SettingsState } from "@/actions/settings";
import { Alert, Button, Field, inputClass } from "@/components/ui";

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

export function SettingsForm({ current }: { current: number }) {
  const [state, action] = useActionState<SettingsState, FormData>(saveSettingsAction, {});
  const [value, setValue] = useState(String(current));

  return (
    <form action={action} className="card space-y-4 p-6">
      {state.error && <Alert>{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Field
        label="Free years per subject"
        hint="How many of the most recent years free students can access. The rest is Premium."
      >
        <input
          name="free_years"
          type="number"
          min={1}
          max={15}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={inputClass + " w-28"}
        />
      </Field>

      <Save />
    </form>
  );
}
