"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleCheckBig, Loader2 } from "lucide-react";
import { forgotPasswordAction, type ForgotState } from "@/actions/password";
import { Alert, Button, Field, inputClass } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState<ForgotState, FormData>(forgotPasswordAction, {});
  const [email, setEmail] = useState("");

  if (state.success) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-leaf-500/12 text-leaf-400">
          <CircleCheckBig size={22} />
        </div>
        <h2 className="mt-4 text-lg font-bold">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          If an account exists for that address, a reset link is on its way. It works once and
          expires in two hours.
        </p>
        <p className="mt-3 text-xs text-mist/75">
          Nothing arriving? Check your spam folder, or contact support — an administrator can send
          you the link directly.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && <Alert>{state.error}</Alert>}

      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      <Submit />
    </form>
  );
}
