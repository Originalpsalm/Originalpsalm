import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/format";

/**
 * Fades content up as it scrolls into view.
 *
 * Deliberately a server component with no JavaScript: the animation is
 * scroll-driven CSS (see `.gx-reveal` in globals.css). Where the browser does
 * not support scroll-driven animations, or the reader prefers reduced motion,
 * the rule never applies and the content renders normally — there is no state
 * in which it can be left invisible.
 *
 * `delay` staggers items within a group. It is expressed in milliseconds for
 * familiarity and mapped onto a small offset in the scroll range.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  // Cap the stagger so a long list never pushes the last item off its range.
  const offset = Math.min(delay / 10, 18);

  return (
    <div
      className={cn("gx-reveal", className)}
      style={offset ? ({ "--gx-offset": `${offset}%` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
