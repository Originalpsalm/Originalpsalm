"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { recordAction } from "@/lib/admin";
import { normaliseTiers } from "@/lib/content-constants";

export type SettingsState = { error?: string; success?: string };

const freeYearsSchema = z.object({ free_years: z.coerce.number().int().min(1).max(15) });

/** Only the founder changes the free/premium boundary — it affects revenue. */
export async function saveFreeYearsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const actor = await requireOwner();
  const parsed = freeYearsSchema.safeParse(Object.fromEntries(formData));
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

  revalidatePath("/", "layout");
  return { success: `Saved. Free students now get the ${parsed.data.free_years} most recent years.` };
}

/**
 * Saves the timed-test tiers. The form sends parallel count[]/minutes[]/
 * premium[] arrays; we zip, clamp and de-duplicate them into the stored list.
 */
export async function saveSpeedTiersAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const actor = await requireOwner();

  const counts = formData.getAll("count").map((v) => Number(v));
  const minutes = formData.getAll("minutes").map((v) => Number(v));
  const premiumFlags = new Set(formData.getAll("premium").map((v) => String(v)));

  const raw = counts.map((count, i) => ({
    count,
    minutes: minutes[i],
    // A checkbox sends its value only when ticked; we key it by row index.
    premium: premiumFlags.has(String(i)),
  }));

  const tiers = normaliseTiers(raw);
  if (tiers.length === 0) return { error: "Add at least one test length." };
  if (!tiers.some((t) => !t.premium)) {
    return { error: "Keep at least one free length, so free students can try Speed Mode." };
  }

  setSetting("speed_tiers", JSON.stringify(tiers));
  recordAction({
    actorId: actor.id,
    action: "settings.speed_tiers",
    targetType: "settings",
    targetLabel: "Speed Mode lengths",
    detail: tiers.map((t) => `${t.count}q/${t.minutes}m${t.premium ? " P" : ""}`).join(", "),
  });

  revalidatePath("/", "layout");
  revalidatePath("/practice/speed");
  return { success: "Saved. Speed Mode lengths and timers are updated." };
}
