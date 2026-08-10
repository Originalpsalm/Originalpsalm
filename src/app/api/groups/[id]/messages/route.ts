import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupMessages, isMember } from "@/lib/queries";
import { LIMITS, allow } from "@/lib/rate-limit";

type Context = { params: Promise<{ id: string }> };

/** Polled by the group chat every few seconds for anything new. */
export async function GET(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const groupId = Number((await params).id);
  if (!Number.isInteger(groupId) || !isMember(groupId, user.id)) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  const after = Number(new URL(request.url).searchParams.get("after") ?? 0);
  const messages = groupMessages(groupId).filter((message) => message.id > after);

  return NextResponse.json(
    { messages },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const groupId = Number((await params).id);
  if (!Number.isInteger(groupId) || !isMember(groupId, user.id)) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
  }

  if (!allow(`message:${user.id}`, LIMITS.message.max, LIMITS.message.windowMs)) {
    return NextResponse.json(
      { error: "You are sending messages too quickly. Give it a moment." },
      { status: 429 },
    );
  }

  const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";

  if (!body) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  if (body.length > 1000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const result = db
    .prepare(`INSERT INTO messages (group_id, user_id, body) VALUES (?, ?, ?)`)
    .run(groupId, user.id, body);

  const message = db
    .prepare(
      `SELECT m.*, u.name AS author_name, u.username AS author_username, u.avatar_hue
         FROM messages m JOIN users u ON u.id = m.user_id
        WHERE m.id = ?`,
    )
    .get(Number(result.lastInsertRowid));

  return NextResponse.json({ message }, { status: 201 });
}
