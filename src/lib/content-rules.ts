import "server-only";
import { db } from "./db";
import { getNumberSetting } from "./settings";
import { DEFAULT_FREE_YEARS } from "./content-constants";

// Re-export the pure constants so server code can import everything from here.
export {
  DEFAULT_FREE_YEARS,
  SPEED_SECONDS_PER_QUESTION,
  SPEED_OPTIONS,
  speedOption,
} from "./content-constants";

/**
 * The free/premium model, in one place so it "stands the test of time":
 *
 *   - Free students get the N most recent years of each subject, in full.
 *   - Premium unlocks every older year.
 *   - As new years are added, the rule re-applies itself automatically — the
 *     newest years stay free and last year's free papers roll into premium.
 *
 * Gating is computed from the year's recency rank at read time, so there is no
 * stored flag to keep in sync and no "recompute" button to forget.
 */

export function freeYears(): number {
  return Math.max(1, getNumberSetting("free_years", DEFAULT_FREE_YEARS));
}

/** The set of free years for one subject: the `freeYears()` most recent. */
export function freeYearsFor(body: string, subject: string): Set<number> {
  const rows = db
    .prepare(
      `SELECT DISTINCT year FROM questions
        WHERE exam_body = ? AND subject = ?
        ORDER BY year DESC`,
    )
    .all(body, subject) as { year: number }[];
  return new Set(rows.slice(0, freeYears()).map((r) => r.year));
}

export function isPaperFree(body: string, subject: string, year: number): boolean {
  return freeYearsFor(body, subject).has(year);
}

/** Free-year sets for every subject, keyed "BODY|Subject" — used to keep a
 *  free student's Speed test inside free content. */
export function allFreeYearSets(): Map<string, Set<number>> {
  const rows = db
    .prepare(
      `SELECT exam_body, subject, year,
              ROW_NUMBER() OVER (
                PARTITION BY exam_body, subject ORDER BY year DESC
              ) AS rk
         FROM (SELECT DISTINCT exam_body, subject, year FROM questions)`,
    )
    .all() as { exam_body: string; subject: string; year: number; rk: number }[];

  const limit = freeYears();
  const map = new Map<string, Set<number>>();
  for (const row of rows) {
    if (row.rk > limit) continue;
    const key = `${row.exam_body}|${row.subject}`;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(row.year);
  }
  return map;
}
