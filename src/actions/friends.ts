"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function sendRequestAction(formData: FormData) {
  const user = await requireUser();
  const target = Number(formData.get("userId"));
  if (!Number.isInteger(target) || target === user.id) return;

  const exists = db
    .prepare(
      `SELECT 1 FROM friendships
        WHERE (requester_id = ? AND addressee_id = ?)
           OR (requester_id = ? AND addressee_id = ?)`,
    )
    .get(user.id, target, target, user.id);
  if (exists) return;

  db.prepare(
    `INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, 'pending')`,
  ).run(user.id, target);

  revalidatePath("/friends");
}

export async function acceptRequestAction(formData: FormData) {
  const user = await requireUser();
  const friendshipId = Number(formData.get("friendshipId"));

  // Only the person who received the request can accept it.
  db.prepare(
    `UPDATE friendships SET status = 'accepted'
      WHERE id = ? AND addressee_id = ? AND status = 'pending'`,
  ).run(friendshipId, user.id);

  revalidatePath("/friends");
}

export async function declineRequestAction(formData: FormData) {
  const user = await requireUser();
  const friendshipId = Number(formData.get("friendshipId"));

  db.prepare(
    `DELETE FROM friendships
      WHERE id = ? AND (addressee_id = ? OR requester_id = ?)`,
  ).run(friendshipId, user.id, user.id);

  revalidatePath("/friends");
}
