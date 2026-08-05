"use server";

import { redirect } from "next/navigation";
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
                          class_level, state, avatar_hue)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

  // A brand-new account has no other sessions, so this cannot be refused.
  await startSession(Number(result.lastInsertRowid), { force: true });
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

  const user = db
    .prepare(`SELECT * FROM users WHERE email = ? OR username = ?`)
    .get(email, email) as User | undefined;

  // Same message either way, so the form can't be used to discover who has an
  // account here.
  if (!user || !verifyPassword(password, user.password_hash)) {
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
