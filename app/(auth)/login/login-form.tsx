"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/backend/auth/validator";
import type { ApiResponse } from "@/types/api";

interface LoginResponse {
  user: { id: string; fullName: string; email: string };
}

/**
 * Sign-in form.
 *
 * Validates with the same Zod schema the API uses, so the client and server
 * can never disagree about what a valid submission looks like.
 */
export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password, rememberMe });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;

      setFieldErrors({
        ...(flattened.email?.[0] ? { email: flattened.email[0] } : {}),
        ...(flattened.password?.[0] ? { password: flattened.password[0] } : {}),
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const body: ApiResponse<LoginResponse> = await response.json();

      if (!body.success) {
        setFormError(body.message);

        const serverFieldErrors = Object.entries(body.errors).reduce<Record<string, string>>(
          (accumulator, [key, messages]) => {
            const first = messages[0];
            return first ? { ...accumulator, [key]: first } : accumulator;
          },
          {},
        );

        setFieldErrors(serverFieldErrors);
        return;
      }

      // refresh() re-runs the server components that read the session cookie,
      // so the dashboard renders with the new session already in place.
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger-border bg-danger-soft px-3 py-2.5 text-sm text-danger-fg"
        >
          {formError}
        </div>
      ) : null}

      <Field htmlFor="email" label="Email address" error={fieldErrors["email"]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="you@psalmcreations.com"
          value={email}
          hasError={Boolean(fieldErrors["email"])}
          aria-describedby={fieldErrors["email"] ? "email-error" : undefined}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field htmlFor="password" label="Password" error={fieldErrors["password"]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          hasError={Boolean(fieldErrors["password"])}
          aria-describedby={fieldErrors["password"] ? "password-error" : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="rememberMe"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          className="size-4 rounded border-border-strong accent-primary focus-visible:ring-2 focus-visible:ring-ring"
        />
        Keep me signed in
      </label>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
