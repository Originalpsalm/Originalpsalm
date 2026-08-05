"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  changePasswordAction,
  updateProfileAction,
  type ProfileState,
} from "@/actions/profile";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { CLASS_LEVELS, NIGERIAN_STATES } from "@/lib/types";

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ProfileForms({
  user,
}: {
  user: {
    name: string;
    school: string | null;
    class_level: string | null;
    state: string | null;
    phone: string | null;
  };
}) {
  const [profileState, profileAction] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {},
  );
  const [passwordState, passwordAction] = useActionState<ProfileState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <>
      <form action={profileAction} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Your details</h2>

        {profileState.error && <Alert>{profileState.error}</Alert>}
        {profileState.success && <Alert tone="success">{profileState.success}</Alert>}

        <Field label="Full name">
          <input name="name" defaultValue={user.name} required className={inputClass} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class">
            <select name="class_level" defaultValue={user.class_level ?? ""} className={inputClass}>
              <option value="" className="bg-ink-900">
                Not set
              </option>
              {CLASS_LEVELS.map((level) => (
                <option key={level} value={level} className="bg-ink-900">
                  {level}
                </option>
              ))}
            </select>
          </Field>

          <Field label="State">
            <select name="state" defaultValue={user.state ?? ""} className={inputClass}>
              <option value="" className="bg-ink-900">
                Not set
              </option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state} className="bg-ink-900">
                  {state}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="School">
          <input
            name="school"
            defaultValue={user.school ?? ""}
            placeholder="Queens College, Lagos"
            className={inputClass}
          />
        </Field>

        <Field label="Phone (optional)">
          <input
            name="phone"
            defaultValue={user.phone ?? ""}
            placeholder="080…"
            inputMode="tel"
            className={inputClass}
          />
        </Field>

        <Save label="Save changes" />
      </form>

      <form action={passwordAction} className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Change password</h2>

        {passwordState.error && <Alert>{passwordState.error}</Alert>}
        {passwordState.success && <Alert tone="success">{passwordState.success}</Alert>}

        <Field label="Current password">
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </Field>

        <Field label="New password" hint="At least 8 characters.">
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
        </Field>

        <Save label="Update password" />
      </form>
    </>
  );
}
