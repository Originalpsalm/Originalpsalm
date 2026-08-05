"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupByCode, groupById, isMember, makeInviteCode } from "@/lib/queries";

export type GroupState = { error?: string; success?: string };

const MAX_GROUPS_PER_USER = 12;
const MAX_MEMBERS = 60;

const createSchema = z.object({
  name: z.string().trim().min(3, "Give the group a name of at least 3 characters.").max(50),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  exam_body: z.string().trim().max(10).optional().or(z.literal("")),
  subject: z.string().trim().max(40).optional().or(z.literal("")),
  is_private: z.string().optional(),
});

export async function createGroupAction(_prev: GroupState, formData: FormData): Promise<GroupState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const owned = db
    .prepare(`SELECT COUNT(*) AS n FROM group_members WHERE user_id = ?`)
    .get(user.id) as { n: number };
  if (owned.n >= MAX_GROUPS_PER_USER) {
    return { error: `You can belong to at most ${MAX_GROUPS_PER_USER} groups.` };
  }

  const input = parsed.data;
  const code = makeInviteCode();

  const created = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO groups (name, description, exam_body, subject, invite_code, owner_id, is_private)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.name,
        input.description || null,
        input.exam_body || null,
        input.subject || null,
        code,
        user.id,
        input.is_private === "on" ? 1 : 0,
      );
    const groupId = Number(result.lastInsertRowid);
    db.prepare(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'owner')`,
    ).run(groupId, user.id);
    return groupId;
  });

  const groupId = created();
  redirect(`/groups/${groupId}`);
}

export async function joinByCodeAction(_prev: GroupState, formData: FormData): Promise<GroupState> {
  const user = await requireUser();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (code.length !== 6) return { error: "An invite code is 6 characters, like GURU01." };

  const group = groupByCode(code);
  if (!group) return { error: "No group uses that code. Check it with your classmate." };

  if (isMember(group.id, user.id)) redirect(`/groups/${group.id}`);

  const members = db
    .prepare(`SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?`)
    .get(group.id) as { n: number };
  if (members.n >= MAX_MEMBERS) return { error: "That group is already full." };

  db.prepare(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`).run(group.id, user.id);
  redirect(`/groups/${group.id}`);
}

export async function joinGroupAction(formData: FormData) {
  const user = await requireUser();
  const groupId = Number(formData.get("groupId"));
  const group = groupById(groupId);
  if (!group) redirect("/groups");

  // A private group can only be entered with its code.
  if (group.is_private === 1) redirect("/groups");

  if (!isMember(groupId, user.id)) {
    db.prepare(`INSERT INTO group_members (group_id, user_id) VALUES (?, ?)`).run(groupId, user.id);
  }
  redirect(`/groups/${groupId}`);
}

export async function leaveGroupAction(formData: FormData) {
  const user = await requireUser();
  const groupId = Number(formData.get("groupId"));
  const group = groupById(groupId);
  if (!group) redirect("/groups");

  if (group.owner_id === user.id) {
    // The owner leaving hands the group to the longest-standing member; if
    // there is nobody left, the group goes with them.
    const heir = db
      .prepare(
        `SELECT user_id FROM group_members
          WHERE group_id = ? AND user_id != ?
          ORDER BY joined_at LIMIT 1`,
      )
      .get(groupId, user.id) as { user_id: number } | undefined;

    if (heir) {
      db.prepare(`UPDATE groups SET owner_id = ? WHERE id = ?`).run(heir.user_id, groupId);
      db.prepare(`UPDATE group_members SET role = 'owner' WHERE group_id = ? AND user_id = ?`).run(
        groupId,
        heir.user_id,
      );
    } else {
      db.prepare(`DELETE FROM groups WHERE id = ?`).run(groupId);
      redirect("/groups");
    }
  }

  db.prepare(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`).run(groupId, user.id);
  redirect("/groups");
}

export async function sendMessageAction(_prev: GroupState, formData: FormData): Promise<GroupState> {
  const user = await requireUser();
  const groupId = Number(formData.get("groupId"));
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return {};
  if (body.length > 1000) return { error: "That message is too long (1000 characters max)." };
  if (!isMember(groupId, user.id)) return { error: "You are not a member of this group." };

  db.prepare(`INSERT INTO messages (group_id, user_id, body) VALUES (?, ?, ?)`).run(
    groupId,
    user.id,
    body,
  );
  revalidatePath(`/groups/${groupId}`);
  return { success: "sent" };
}
