"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { clearLogo, setLogo } from "@/lib/settings";
import { recordAction } from "@/lib/admin";

const MAX_BYTES = 1_000_000; // 1 MB — a logo has no business being bigger
// SVG is deliberately excluded: an SVG can carry script, and though only the
// owner can upload one, a raster-only allowlist removes the risk entirely.
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export type BrandingState = { error?: string; success?: string };

/** Only the founder changes the app's face. */
export async function uploadLogoAction(
  _prev: BrandingState,
  formData: FormData,
): Promise<BrandingState> {
  const actor = await requireOwner();
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Use a PNG, JPG, WEBP or SVG image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That image is over 1 MB. Please use a smaller file." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  setLogo(buffer, file.type);

  recordAction({
    actorId: actor.id,
    action: "branding.logo_upload",
    targetType: "settings",
    targetLabel: "App logo",
    detail: `${file.type}, ${Math.round(file.size / 1024)} KB`,
  });

  revalidatePath("/", "layout");
  redirect("/admin/branding?updated=1");
}

export async function removeLogoAction() {
  const actor = await requireOwner();
  clearLogo();
  recordAction({
    actorId: actor.id,
    action: "branding.logo_remove",
    targetType: "settings",
    targetLabel: "App logo",
  });
  revalidatePath("/", "layout");
  redirect("/admin/branding");
}
