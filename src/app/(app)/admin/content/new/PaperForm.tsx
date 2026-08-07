"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { createPaperAction, type ContentState } from "@/actions/content";
import { Alert, Button, Field, inputClass } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? "Creating…" : "Create paper and add questions"}
    </Button>
  );
}

export function PaperForm({
  bodies,
  knownSubjects,
}: {
  bodies: string[];
  knownSubjects: string[];
}) {
  const [state, action] = useActionState<ContentState, FormData>(createPaperAction, {});
  const [subject, setSubject] = useState("");

  return (
    <form action={action} className="card space-y-4 p-6">
      {state.error && <Alert>{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exam body">
          <select name="exam_body" defaultValue={bodies[0]} required className={inputClass}>
            {bodies.map((body) => (
              <option key={body} value={body} className="bg-ink-900">
                {body}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year">
          <input
            name="year"
            type="number"
            required
            min={1990}
            max={2100}
            defaultValue={new Date().getUTCFullYear()}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Subject" hint="Type a new subject or pick one you have used before.">
        <input
          name="subject"
          list="known-subjects"
          required
          maxLength={60}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Mathematics"
          className={inputClass}
        />
        <datalist id="known-subjects">
          {knownSubjects.map((entry) => (
            <option key={entry} value={entry} />
          ))}
        </datalist>
      </Field>

      <Submit />
    </form>
  );
}
