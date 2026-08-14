import { NextResponse } from "next/server";
import { getAvatarBlob } from "@/lib/avatars";

/**
 * Serves a user's uploaded profile picture, or 404 when they have none (the
 * Avatar component then shows their initials). The URL carries a ?v=version
 * query that changes on every upload, so a long cache is safe.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return new NextResponse(null, { status: 404 });
  }

  const avatar = getAvatarBlob(userId);
  if (!avatar) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(avatar.blob), {
    headers: {
      "Content-Type": avatar.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
