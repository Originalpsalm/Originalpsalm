/** Formatting helpers shared across the platform. */

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** Full naira amount — e.g. ₦3,000,000. */
export function naira(amount: number): string {
  return nairaFormatter.format(amount);
}

/** Compact naira amount for tight spaces — e.g. ₦3M, ₦400K. */
export function nairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${trim(amount / 1_000_000_000)}B`;
  if (amount >= 1_000_000) return `₦${trim(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `₦${trim(amount / 1_000)}K`;
  return `₦${amount}`;
}

function trim(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Percentage of a target reached, clamped to 0–100. */
export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

/** Join class names, dropping falsy values. */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
