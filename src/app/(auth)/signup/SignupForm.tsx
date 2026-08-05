"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signupAction, type AuthState } from "@/actions/auth";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { CLASS_LEVELS, NIGERIAN_STATES } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending ? "Creating your account…" : "Create my account"}
    </Button>
  );
}

const EMPTY = {
  name: "",
  username: "",
  email: "",
  password: "",
  school: "",
  class_level: "SS3",
  state: "",
};

export function SignupForm() {
  const [state, action] = useActionState<AuthState, FormData>(signupAction, {});
  const [showPassword, setShowPassword] = useState(false);

  // React clears uncontrolled fields once a form action completes, which would
  // wipe the whole form on a single validation error. Keeping the values in
  // state means a rejected sign-up only costs the student one correction.
  const [values, setValues] = useState(EMPTY);
  const bind = (field: keyof typeof EMPTY) => ({
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((previous) => ({ ...previous, [field]: event.target.value })),
  });

  return (
    <form action={action} className="space-y-5">
      {state.error && <Alert>{state.error}</Alert>}

      <Field label="Full name">
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Amaka Obi"
          className={inputClass}
          {...bind("name")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Username" hint="Classmates find you with this.">
          <input
            name="username"
            required
            autoComplete="off"
            pattern="[A-Za-z0-9_]{3,20}"
            placeholder="amaka"
            className={inputClass}
            {...bind("username")}
          />
        </Field>

        <Field label="Class">
          <select name="class_level" className={inputClass} {...bind("class_level")}>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level} className="bg-ink-900">
                {level}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
          {...bind("email")}
        />
      </Field>

      <Field label="Password" hint="At least 8 characters.">
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass + " pr-12"}
            {...bind("password")}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="School (optional)">
          <input
            name="school"
            placeholder="Queens College, Lagos"
            className={inputClass}
            {...bind("school")}
          />
        </Field>

        <Field label="State (optional)">
          <select name="state" className={inputClass} {...bind("state")}>
            <option value="" className="bg-ink-900">
              Select state
            </option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state} className="bg-ink-900">
                {state}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <SubmitButton />

      <p className="text-center text-xs leading-relaxed text-mist/80">
        Accounts are personal. GURU allows one device signed in at a time — if you share your login,
        the other person kicks you out of your own account.
      </p>
    </form>
  );
}
