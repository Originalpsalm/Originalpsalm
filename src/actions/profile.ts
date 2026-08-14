"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AVATAR_ALLOWED_MIME,
  AVATAR_MAX_BYTES,
  clearAvatar,
  setAvatar,
} from "@/lib/avatars";
import { validatePassword } from "@/lib/password-policy";

export type ProfileState = { error?: string; success?: string };

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(60),
  school: z.string().trim().max(80).optional().or(z.literal("")),
  class_level: z.string().trim().max(20).optional().or(z.literal("")),
  state: z.string().trim().max(40).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const input = parsed.data;

  db.prepare(
    `UPDATE users SET name = ?, school = ?, class_level = ?, state = ?, phone = ?
      WHERE id = ?`,
  ).run(
    input.name,
    input.school || null,
    input.class_level || null,
    input.state || null,
    input.phone || null,
    user.id,
  );

  revalidatePath("/account");
  return { success: "Profile saved." };
}

const passwordSchema = z.object({
  current: z.string().min(1, "Enter your current password."),
  next: z.string().min(8, "New password must be at least 8 characters."),
});

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  if (!verifyPassword(parsed.data.current, user.password_hash)) {
    return { error: "Your current password is not correct." };
  }

  const strong = await validatePassword(parsed.data.next, [
    user.name,
    user.username,
    user.email,
  ]);
  if (!strong.ok) return { error: strong.error };

  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(
    hashPassword(parsed.data.next),
    user.id,
  );

  revalidatePath("/account");
  return { success: "Password changed. Other devices stay signed out." };
}

// -------------------------------------------------------------- profile photo

/** A user's own profile picture — capped at 1 MB and to real image types. */
export async function uploadAvatarAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!AVATAR_ALLOWED_MIME.has(file.type)) {
    return { error: "Use a JPG, PNG or WEBP image." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "That photo is over 1 MB. Please pick a smaller one." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  setAvatar(user.id, buffer, file.type);

  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { success: "Profile picture updated." };
}

export async function removeAvatarAction(): Promise<ProfileState> {
  const user = await requireUser();
  clearAvatar(user.id);
  revalidatePath("/", "layout");
  revalidatePath("/account");
  return { success: "Profile picture removed." };
}
