"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  endSession,
  getCurrentUser,
  hashPassword,
  revokeAllSessions,
  revokeSession,
  startSession,
  verifyPassword,
  type ActiveSession,
} from "@/lib/auth";
import type { User } from "@/lib/types";
import { LIMITS, allow, callerIp } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-policy";
import { startEmailVerification } from "@/lib/verification";
import crypto from "node:crypto";

/** Best-effort base URL for links in emails, from the incoming request. */
async function currentAppUrl(): Promise<string> {
  const head = await headers();
  const proto = head.get("x-forwarded-proto") ?? "https";
  const host = head.get("host") ?? "localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
}

// A throwaway hash used to equalise login timing when no account matches —
// hashing runs whether or not the user exists, so response time reveals
// nothing. Never matches a typed password.
const DUMMY_HASH = hashPassword(crypto.randomUUID());

export type AuthState = {
  error?: string;
  /** Set when the account is already signed in elsewhere. */
  concurrent?: { sessions: ActiveSession[]; email: string };
};

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers and underscore."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters."),
  school: z.string().trim().max(80).optional().or(z.literal("")),
  class_level: z.string().trim().max(20).optional().or(z.literal("")),
  state: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const input = parsed.data;

  if (!allow(`signup:${await callerIp()}`, LIMITS.signup.max, LIMITS.signup.windowMs)) {
    return { error: "Too many accounts created from this connection. Try again later." };
  }

  // Explicit, recorded consent to the Terms and Privacy Policy.
  if (formData.get("terms") !== "on") {
    return { error: "Please agree to the Terms of Service and Privacy Policy to continue." };
  }

  const strong = await validatePassword(input.password, [input.name, input.username, input.email]);
  if (!strong.ok) return { error: strong.error };

  const clash = db
    .prepare(`SELECT email, username FROM users WHERE email = ? OR username = ?`)
    .get(input.email, input.username) as { email: string; username: string } | undefined;
  if (clash) {
    return {
      error:
        clash.email === input.email
          ? "An account with this email already exists. Try signing in."
          : "That username is taken. Please choose another.",
    };
  }

  const result = db
    .prepare(
      `INSERT INTO users (name, username, email, phone, password_hash, school,
                          class_level, state, avatar_hue, terms_accepted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      input.name,
      input.username,
      input.email,
      input.phone || null,
      hashPassword(input.password),
      input.school || null,
      input.class_level || null,
      input.state || null,
      Math.floor(Math.random() * 360),
    );

  const newUserId = Number(result.lastInsertRowid);

  // A brand-new account has no other sessions, so this cannot be refused.
  await startSession(newUserId, { force: true });

  // Send the "confirm your email" link when email is configured. Non-blocking:
  // a delivery hiccup must never stop a student from getting into the app.
  await startEmailVerification(
    { id: newUserId, email: input.email, name: input.name },
    await currentAppUrl(),
  );

  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { email, password } = parsed.data;
  const force = formData.get("force") === "1";

  // Keyed on IP + identifier: a guessing script is cut off, while a student
  // on shared school wifi trying their own account is not.
  if (!allow(`login:${await callerIp()}:${email}`, LIMITS.login.max, LIMITS.login.windowMs)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const user = db
    .prepare(`SELECT * FROM users WHERE email = ? OR username = ?`)
    .get(email, email) as User | undefined;

  // Same message either way, so the form can't be used to discover who has an
  // account here. Hashing runs on both paths too — otherwise the fast
  // "no such user" response would leak which emails are registered.
  const passwordOk = verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    return { error: "Email or password is not correct." };
  }

  if (user.locked_until && new Date(user.locked_until.replace(" ", "T") + "Z") > new Date()) {
    return {
      error:
        user.lock_reason ??
        "This account is temporarily locked. Please try again later or contact support.",
    };
  }

  const started = await startSession(user.id, { force });
  if (!started.ok) {
    return { concurrent: { sessions: started.sessions, email } };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}

/** Ends one other session from the account page. */
export async function revokeSessionAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sessionId = String(formData.get("sessionId") ?? "");
  const owned = db
    .prepare(`SELECT 1 FROM sessions WHERE id = ? AND user_id = ?`)
    .get(sessionId, user.id);
  if (owned) revokeSession(sessionId, "user");

  if (sessionId === user.sessionId) {
    await endSession();
    redirect("/login");
  }
  redirect("/account");
}

/** "Sign out everywhere else" — keeps the current device signed in. */
export async function revokeOtherSessionsAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  revokeAllSessions(user.id, "user", user.sessionId);
  redirect("/account");
}
