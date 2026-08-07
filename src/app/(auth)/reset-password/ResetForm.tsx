"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPasswordAction, type ResetState } from "@/actions/password";
import { Alert, Button, Field, inputClass } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending ? "Saving…" : "Set new password"}
    </Button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<ResetState, FormData>(resetPasswordAction, {});
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.error && <Alert>{state.error}</Alert>}

      <Field label="New password" hint="At least 8 characters.">
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            minLength={8}
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass + " pr-12"}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="focus-ring absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-mist hover:text-chalk"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <Submit />
    </form>
  );
}
