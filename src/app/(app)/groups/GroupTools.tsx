"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Loader2, Plus, X } from "lucide-react";
import {
  createGroupAction,
  joinByCodeAction,
  type GroupState,
} from "@/actions/groups";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { EXAM_BODIES } from "@/lib/types";

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 size={16} className="animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function GroupTools() {
  const [creating, setCreating] = useState(false);
  const [createState, createFormAction] = useActionState<GroupState, FormData>(
    createGroupAction,
    {},
  );
  const [joinState, joinFormAction] = useActionState<GroupState, FormData>(joinByCodeAction, {});

  // React clears uncontrolled fields after a form action runs, so anything the
  // student typed is held in state and survives a rejected submission.
  const [draft, setDraft] = useState({ name: "", description: "", subject: "" });
  const [code, setCode] = useState("");
  const bind = (field: keyof typeof draft) => ({
    value: draft[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((previous) => ({ ...previous, [field]: event.target.value })),
  });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="focus-ring card flex items-center gap-4 p-5 text-left transition hover:border-leaf-500/35"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-500/10 text-leaf-400">
            <Plus size={21} strokeWidth={2.3} />
          </span>
          <span>
            <span className="block font-semibold">Create a group</span>
            <span className="block text-xs text-mist">
              You get an invite code to share with your class
            </span>
          </span>
        </button>

        <form action={joinFormAction} className="card p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
              <KeyRound size={20} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="invite-code" className="block text-sm font-semibold">
                Join with a code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="invite-code"
                  name="code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="GURU01"
                  className={
                    inputClass + " px-3 py-2 font-mono uppercase tracking-[0.3em] placeholder:tracking-normal"
                  }
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Join
                </Button>
              </div>
            </div>
          </div>
          {joinState.error && (
            <p className="mt-3 text-xs text-red-300" role="alert">
              {joinState.error}
            </p>
          )}
        </form>
      </div>

      {/* ------------------------------------------------- create modal --- */}
      {creating && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/80 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-group-heading"
        >
          <form action={createFormAction} className="card w-full max-w-md p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="create-group-heading" className="text-lg font-bold">
                  Create a study group
                </h2>
                <p className="mt-1 text-sm text-mist">
                  You will get an invite code to share with your classmates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="focus-ring grid size-8 shrink-0 place-items-center rounded-full text-mist hover:text-chalk"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4">
              {createState.error && <Alert>{createState.error}</Alert>}

              <Field label="Group name">
                <input
                  name="name"
                  required
                  maxLength={50}
                  placeholder="SS3 WAEC Maths Squad"
                  className={inputClass}
                  {...bind("name")}
                />
              </Field>

              <Field label="What is this group for? (optional)">
                <textarea
                  name="description"
                  rows={3}
                  maxLength={200}
                  placeholder="We solve 10 past questions every evening by 7pm."
                  className={inputClass + " resize-none"}
                  {...bind("description")}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Exam body">
                  <select name="exam_body" defaultValue="" className={inputClass}>
                    <option value="" className="bg-ink-900">
                      Any
                    </option>
                    {EXAM_BODIES.map((body) => (
                      <option key={body.id} value={body.id} className="bg-ink-900">
                        {body.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Subject (optional)">
                  <input
                    name="subject"
                    maxLength={40}
                    placeholder="Mathematics"
                    className={inputClass}
                    {...bind("subject")}
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 rounded-xl bg-ink-900/50 p-3.5">
                <input
                  type="checkbox"
                  name="is_private"
                  className="mt-0.5 size-4 accent-[#17c471]"
                />
                <span className="text-sm">
                  <span className="block font-medium">Private group</span>
                  <span className="block text-xs text-mist">
                    Only people with the invite code can join. It stays out of the public list.
                  </span>
                </span>
              </label>

              <Submit label="Create group" pendingLabel="Creating…" />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
