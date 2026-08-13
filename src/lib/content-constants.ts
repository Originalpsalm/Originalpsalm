/**
 * Pure content-model constants — safe to import from client components (no
 * database, no server-only). The database-backed rules live in content-rules.ts.
 */

export const DEFAULT_FREE_YEARS = 3;

/** Speed Mode lengths. Free students get the 10-question test; premium unlocks
 *  the longer full mocks. */
export const SPEED_SECONDS_PER_QUESTION = 60;

export const SPEED_OPTIONS = [
  { count: 10, label: "Quick test", premium: false },
  { count: 20, label: "Half mock", premium: true },
  { count: 40, label: "Full mock", premium: true },
] as const;

export function speedOption(count: number) {
  return SPEED_OPTIONS.find((o) => o.count === count) ?? SPEED_OPTIONS[0];
}
