import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FieldProps {
  /** Must match the control's `id` so clicking the label focuses it. */
  htmlFor: string;
  label: string;
  /** Helper text explaining the field; announced with the control. */
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Label + description + error wrapper used by every form field, so accessible
 * naming and error announcement are consistent across the suite.
 */
export function Field({
  htmlFor,
  label,
  description,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary">
        {label}
      </label>

      {description ? (
        <p id={`${htmlFor}-description`} className="text-xs text-text-muted">
          {description}
        </p>
      ) : null}

      {children}

      {error ? (
        // role="alert" so screen readers announce validation failures as they
        // appear, rather than only on refocus.
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger-fg">
          {error}
        </p>
      ) : null}
    </div>
  );
}
