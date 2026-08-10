import { NextResponse } from "next/server";
import { getLogoBlob } from "@/lib/settings";

/** Serves the owner-uploaded logo, or 404 so the inline default is used. */
export async function GET() {
  const logo = getLogoBlob();
  if (!logo) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(logo.blob), {
    headers: {
      "Content-Type": logo.mime,
      // Immutable-ish: the URL carries a version query, so a long cache is safe.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
