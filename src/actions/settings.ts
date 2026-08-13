"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { recordAction } from "@/lib/admin";

export type SettingsState = { error?: string; success?: string };

const schema = z.object({
  free_years: z.coerce.number().int().min(1).max(15),
});

/** Only the founder changes the free/premium boundary — it affects revenue. */
export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const actor = await requireOwner();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Free years must be a whole number between 1 and 15." };
  }

  setSetting("free_years", String(parsed.data.free_years));

  recordAction({
    actorId: actor.id,
    action: "settings.free_years",
    targetType: "settings",
    targetLabel: "Free years",
    detail: `Set to ${parsed.data.free_years}`,
  });

  // Gating is computed from this everywhere, so refresh the whole app.
  revalidatePath("/", "layout");
  return { success: `Saved. Free students now get the ${parsed.data.free_years} most recent years.` };
}
