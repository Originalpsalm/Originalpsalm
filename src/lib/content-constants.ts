/**
 * Pure content-model constants — safe to import from client components (no
 * database, no server-only). The database-backed rules live in content-rules.ts.
 */

export const DEFAULT_FREE_YEARS = 3;

/**
 * A timed-test tier: how many questions, how many minutes on the clock, and
 * whether it needs Premium. Admins add, remove and edit these on the Settings
 * tab, so counts and timing are fully under their control.
 */
export type SpeedTier = { count: number; minutes: number; premium: boolean };

export const DEFAULT_SPEED_TIERS: SpeedTier[] = [
  { count: 10, minutes: 10, premium: false },
  { count: 20, minutes: 20, premium: true },
  { count: 40, minutes: 40, premium: true },
];

/** Clamp/repair a tier list coming from storage or a form. */
export function normaliseTiers(raw: unknown): SpeedTier[] {
  if (!Array.isArray(raw)) return DEFAULT_SPEED_TIERS;
  const tiers = raw
    .map((t) => ({
      count: Math.max(1, Math.min(200, Math.round(Number((t as SpeedTier)?.count)))),
      minutes: Math.max(1, Math.min(300, Math.round(Number((t as SpeedTier)?.minutes)))),
      premium: Boolean((t as SpeedTier)?.premium),
    }))
    .filter((t) => Number.isFinite(t.count) && Number.isFinite(t.minutes))
    // De-duplicate by count, keeping the first.
    .filter((t, i, arr) => arr.findIndex((o) => o.count === t.count) === i)
    .sort((a, b) => a.count - b.count);
  return tiers.length ? tiers : DEFAULT_SPEED_TIERS;
}

export function findTier(tiers: SpeedTier[], count: number): SpeedTier | undefined {
  return tiers.find((t) => t.count === count);
}
