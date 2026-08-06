"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, isOwner, requireAdmin, requireOwner, revokeAllSessions } from "@/lib/auth";
import { activatePremium } from "@/lib/billing";
import { db } from "@/lib/db";
import { adminUserById, recordAction } from "@/lib/admin";
import type { Role, User } from "@/lib/types";

/**
 * Admins may act on students. They may not act on the owner, on another
 * admin, or on themselves — those need the founder. This is the check every
 * action below runs before touching anything.
 */
function assertCanActOn(actor: User & { id: number }, target: User | undefined): asserts target is User {
  if (!target) redirect("/admin/users");
  if (target.id === actor.id) redirect(`/admin/users/${target.id}`);
  if (isAdmin(target) && !isOwner(actor)) redirect(`/admin/users/${target.id}`);
  if (isOwner(target)) redirect(`/admin/users/${target.id}`);
}

function refreshUser(id: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

// ------------------------------------------------------------ subscriptions

export async function grantPremiumAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("userId"));
  const months = Math.max(1, Math.min(24, Number(formData.get("months") ?? 1)));
  const target = adminUserById(id);
  assertCanActOn(actor, target);

  activatePremium(target.id, months);
  recordAction({
    actorId: actor.id,
    action: "premium.grant",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
    detail: `${months} month${months === 1 ? "" : "s"} granted manually`,
  });
  refreshUser(target.id);
}

export async function revokePremiumAction(formData: FormData) {
  const actor = await requireAdmin();
  const target = adminUserById(Number(formData.get("userId")));
  assertCanActOn(actor, target);

  db.prepare(`UPDATE users SET plan = 'free', plan_expires_at = NULL WHERE id = ?`).run(target.id);
  recordAction({
    actorId: actor.id,
    action: "premium.revoke",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
  });
  refreshUser(target.id);
}

// ---------------------------------------------------------------- lockouts

/**
 * The support action that will be needed most: the device rules are strict by
 * design, so a student who changed phone legitimately needs a way back in.
 */
export async function unlockAccountAction(formData: FormData) {
  const actor = await requireAdmin();
  const target = adminUserById(Number(formData.get("userId")));
  assertCanActOn(actor, target);

  db.prepare(`UPDATE users SET locked_until = NULL, lock_reason = NULL WHERE id = ?`).run(target.id);
  // Clearing the device history stops the same rolling cap re-locking them.
  db.prepare(`DELETE FROM known_devices WHERE user_id = ?`).run(target.id);

  recordAction({
    actorId: actor.id,
    action: "account.unlock",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
    detail: "Lock cleared and device history reset",
  });
  refreshUser(target.id);
}

export async function signOutEverywhereAction(formData: FormData) {
  const actor = await requireAdmin();
  const target = adminUserById(Number(formData.get("userId")));
  assertCanActOn(actor, target);

  revokeAllSessions(target.id, "admin");
  recordAction({
    actorId: actor.id,
    action: "account.signout_all",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
  });
  refreshUser(target.id);
}

export async function lockAccountAction(formData: FormData) {
  const actor = await requireAdmin();
  const target = adminUserById(Number(formData.get("userId")));
  const reason = String(formData.get("reason") ?? "").trim() || "Suspended by an administrator.";
  const days = Math.max(1, Math.min(365, Number(formData.get("days") ?? 7)));
  assertCanActOn(actor, target);

  db.prepare(
    `UPDATE users SET locked_until = datetime('now', ?), lock_reason = ? WHERE id = ?`,
  ).run(`+${days} days`, reason, target.id);
  revokeAllSessions(target.id, "admin");

  recordAction({
    actorId: actor.id,
    action: "account.suspend",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
    detail: `${days} day${days === 1 ? "" : "s"} — ${reason}`,
  });
  refreshUser(target.id);
}

// ------------------------------------------------------------------- roles

/** Only the founder hands out or takes back staff access. */
export async function setRoleAction(formData: FormData) {
  const actor = await requireOwner();
  const target = adminUserById(Number(formData.get("userId")));
  const role = String(formData.get("role") ?? "student") as Role;

  if (!target || target.id === actor.id) redirect("/admin/users");
  if (role !== "student" && role !== "admin") redirect(`/admin/users/${target.id}`);

  db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, target.id);
  recordAction({
    actorId: actor.id,
    action: role === "admin" ? "role.promote" : "role.demote",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username})`,
    detail: `Role set to ${role}`,
  });
  refreshUser(target.id);
}

// ------------------------------------------------------------------ delete

export async function deleteUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const target = adminUserById(Number(formData.get("userId")));
  const confirmation = String(formData.get("confirm") ?? "").trim();
  assertCanActOn(actor, target);

  // Typing the username is the guard against a mis-click wiping a real
  // student's history — every attempt, group and message goes with them.
  if (confirmation !== target.username) redirect(`/admin/users/${target.id}?error=confirm`);

  recordAction({
    actorId: actor.id,
    action: "account.delete",
    targetType: "user",
    targetId: target.id,
    targetLabel: `${target.name} (@${target.username}, ${target.email})`,
    detail: "Account and all related data removed",
  });
  // Foreign keys cascade, so this clears sessions, attempts, memberships,
  // messages and payments too.
  db.prepare(`DELETE FROM users WHERE id = ?`).run(target.id);

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

// ------------------------------------------------------------- moderation

export async function deleteGroupAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("groupId"));
  const group = db.prepare(`SELECT id, name FROM groups WHERE id = ?`).get(id) as
    | { id: number; name: string }
    | undefined;
  if (!group) redirect("/admin/groups");

  recordAction({
    actorId: actor.id,
    action: "group.delete",
    targetType: "group",
    targetId: group.id,
    targetLabel: group.name,
  });
  db.prepare(`DELETE FROM groups WHERE id = ?`).run(group.id);

  revalidatePath("/admin/groups");
  redirect("/admin/groups");
}

export async function deleteMessageAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("messageId"));
  const message = db
    .prepare(
      `SELECT m.id, m.body, u.username FROM messages m
         JOIN users u ON u.id = m.user_id WHERE m.id = ?`,
    )
    .get(id) as { id: number; body: string; username: string } | undefined;
  if (!message) redirect("/admin/moderation");

  recordAction({
    actorId: actor.id,
    action: "message.delete",
    targetType: "message",
    targetId: message.id,
    targetLabel: `@${message.username}`,
    detail: message.body.slice(0, 140),
  });
  db.prepare(`DELETE FROM messages WHERE id = ?`).run(message.id);

  revalidatePath("/admin/moderation");
}

// -------------------------------------------------------------- payments

/**
 * For the "my bank debited me but nothing happened" ticket. Approving records
 * who did it and why, so a manual unlock is never anonymous.
 */
export async function approvePaymentAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("paymentId"));
  const note = String(formData.get("note") ?? "").trim();

  const payment = db
    .prepare(
      `SELECT p.*, u.name AS user_name, u.username FROM payments p
         JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
    )
    .get(id) as
    | {
        id: number;
        user_id: number;
        reference: string;
        amount_kobo: number;
        months: number;
        status: string;
        user_name: string;
        username: string;
      }
    | undefined;

  if (!payment || payment.status === "success") redirect("/admin/payments");

  activatePremium(payment.user_id, payment.months);
  db.prepare(
    `UPDATE payments SET status = 'success', verified_at = datetime('now') WHERE id = ?`,
  ).run(payment.id);

  recordAction({
    actorId: actor.id,
    action: "payment.approve",
    targetType: "payment",
    targetId: payment.id,
    targetLabel: `${payment.reference} — ${payment.user_name} (@${payment.username})`,
    detail: note || `₦${(payment.amount_kobo / 100).toLocaleString("en-NG")} approved manually`,
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function rejectPaymentAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = Number(formData.get("paymentId"));
  const payment = db.prepare(`SELECT id, reference, status FROM payments WHERE id = ?`).get(id) as
    | { id: number; reference: string; status: string }
    | undefined;
  if (!payment || payment.status === "success") redirect("/admin/payments");

  db.prepare(`UPDATE payments SET status = 'failed' WHERE id = ?`).run(payment.id);
  recordAction({
    actorId: actor.id,
    action: "payment.reject",
    targetType: "payment",
    targetId: payment.id,
    targetLabel: payment.reference,
  });
  revalidatePath("/admin/payments");
}
