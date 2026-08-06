import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/** Text input primitive with the suite's focus and error treatments. */
export function Input({ hasError = false, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={hasError || undefined}
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text-primary",
        "placeholder:text-text-muted",
        "transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError ? "border-danger-fg" : "border-border-strong",
        className,
      )}
      {...props}
    />
  );
}
