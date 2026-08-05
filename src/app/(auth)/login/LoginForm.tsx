"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2, MonitorSmartphone } from "lucide-react";
import { loginAction, type AuthState } from "@/actions/auth";
import { Alert, Button, Field, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  // React clears uncontrolled fields once a form action completes. Holding the
  // credentials in state keeps them after a failed attempt, so the student does
  // not retype — and so the "continue here" button below can resubmit them.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-5">
      {state.error && <Alert>{state.error}</Alert>}

      {state.concurrent && (
        <div className="surface space-y-3 p-4">
          <div className="flex items-start gap-3">
            <MonitorSmartphone size={20} className="mt-0.5 shrink-0 text-gold-400" />
            <div className="text-sm">
              <p className="font-semibold text-gold-400">
                This account is already signed in somewhere else
              </p>
              <p className="mt-1 text-mist">
                GURU allows one device at a time, so accounts cannot be shared. If the device below
                is yours, you can sign out of it and continue here.
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs text-mist">
            {state.concurrent.sessions.map((session) => (
              <li
                key={session.id}
                className="flex justify-between gap-3 rounded-lg bg-ink-900/60 px-3 py-2"
              >
                <span className="font-medium text-chalk">{session.device_label}</span>
                <span>last active {session.last_seen_at.slice(0, 16)} UTC</span>
              </li>
            ))}
          </ul>

          {/* The button carries the flag itself, so the same credentials are
              resubmitted with `force` set — no extra state to keep in sync. */}
          <Button type="submit" name="force" value="1" variant="gold" size="sm" className="w-full">
            Sign out that device and continue here
          </Button>
        </div>
      )}

      <Field label="Email or username">
        <input
          name="email"
          type="text"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      <Field label="Password">
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={inputClass + " pr-12"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="focus-ring absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-mist hover:text-chalk"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>

      <SubmitButton />

      <p className="rounded-xl bg-ink-900/50 px-4 py-3 text-center text-xs text-mist">
        Demo account — <span className="text-chalk">amaka@guru.ng</span> /{" "}
        <span className="text-chalk">guru1234</span>
      </p>
    </form>
  );
}
