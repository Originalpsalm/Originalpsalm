import Link from "next/link";

import { cn } from "@/lib/format";

/**
 * Green-X mark — a leaf enclosed in a rounded square, with the wordmark set in
 * the display face. The "X" is picked out in the tomato accent.
 */
export function Logo({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "invert";
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Green-X Farm — home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-fg transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
          <path
            d="M12 20.5C12 13 15.5 8.5 20.5 7.5c0 6.5-3.5 11-8.5 12Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M11.4 20.5C11.4 15 8.6 11.4 4.5 10.6c0 5 2.8 8.8 6.9 9.6Z"
            fill="currentColor"
            opacity="0.55"
          />
          <path
            d="M12 21v-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[1.05rem] font-semibold tracking-tight",
          tone === "invert" ? "text-text-inverted" : "text-text-primary",
        )}
      >
        Green<span className="text-accent">-X</span>{" "}
        <span
          className={cn(
            "font-normal",
            tone === "invert" ? "text-text-inverted/60" : "text-text-muted",
          )}
        >
          Farm
        </span>
      </span>
    </Link>
  );
}
