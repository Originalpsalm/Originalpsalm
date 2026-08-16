import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const width =
    size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", width, className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "sunken" | "invert";
  id?: string;
}) {
  const tones = {
    default: "bg-background text-text-primary",
    sunken: "bg-surface-sunken text-text-primary",
    invert: "bg-surface-invert text-text-inverted",
  } as const;
  return (
    <section id={id} className={cn("py-16 sm:py-24", tones[tone], className)}>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export function Eyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "invert";
}) {
  return (
    <p
      className={cn(
        "mb-4 flex items-center gap-2.5 text-[0.7rem] font-semibold tracking-[0.16em] uppercase",
        tone === "invert" ? "text-primary" : "text-primary",
      )}
    >
      <span
        aria-hidden
        className="h-px w-6 bg-current opacity-50"
      />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "default",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "default" | "invert";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "font-display text-3xl leading-[1.12] font-semibold text-balance sm:text-4xl",
          tone === "invert" ? "text-text-inverted" : "text-text-primary",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 text-base leading-7 text-pretty sm:text-lg sm:leading-8",
            tone === "invert" ? "text-text-inverted/70" : "text-text-secondary",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 text-base leading-7 text-pretty text-text-secondary",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export type BadgeTone =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "harvest";

const badgeTones: Record<BadgeTone, string> = {
  primary: "bg-primary-soft text-primary border-primary-border",
  accent: "bg-accent-soft text-accent border-accent-border",
  success: "bg-success-soft text-success-fg border-success-border",
  warning: "bg-warning-soft text-warning-fg border-warning-border",
  danger: "bg-danger-soft text-danger-fg border-danger-border",
  neutral: "bg-neutral-soft text-neutral-fg border-neutral-border",
  harvest: "bg-harvest-soft text-harvest border-harvest-border",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marks placeholder content so it can never be mistaken for a real record. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge tone="warning" className={cn("font-semibold", className)}>
      <span aria-hidden>◆</span> Sample
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "invert";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "border border-border-strong bg-surface text-text-primary hover:border-primary hover:text-primary",
  ghost: "text-text-secondary hover:text-primary hover:bg-primary-soft",
  invert:
    "bg-text-inverted text-surface-invert hover:bg-text-inverted/90 shadow-sm",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  if (external) {
    return (
      <a
        href={href}
        className={cn(buttonBase, buttonVariants[variant], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={cn(buttonBase, buttonVariants[variant], className)}
    >
      {children}
    </Link>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Cards & data display                                                */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "sunken" | "invert";
  id?: string;
}) {
  const tones = {
    default: "bg-surface border-border-subtle",
    sunken: "bg-surface-sunken border-border-subtle",
    invert: "bg-surface-invert-raised border-white/10 text-text-inverted",
  } as const;
  return (
    <div id={id} className={cn("rounded-2xl border", tones[tone], className)}>
      {children}
    </div>
  );
}

export function Stat({
  value,
  label,
  detail,
  tone = "default",
}: {
  value: ReactNode;
  label: string;
  detail?: string;
  tone?: "default" | "invert";
}) {
  return (
    <div>
      <p
        className={cn(
          "font-display text-3xl font-semibold sm:text-4xl",
          tone === "invert" ? "text-text-inverted" : "text-text-primary",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-sm font-medium",
          tone === "invert" ? "text-primary" : "text-primary",
        )}
      >
        {label}
      </p>
      {detail ? (
        <p
          className={cn(
            "mt-1 text-sm leading-6",
            tone === "invert" ? "text-text-inverted/55" : "text-text-muted",
          )}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}

/** Definition row used in spec tables across opportunity and project pages. */
export function DataRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 border-b border-border-subtle py-3.5 last:border-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4",
        className,
      )}
    >
      <dt className="text-sm font-medium text-text-muted">{label}</dt>
      <dd className="text-sm leading-6 text-text-primary">{children}</dd>
    </div>
  );
}

/** Full-width note used for disclaimers and content-flag warnings. */
export function Notice({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "warning" | "primary";
  className?: string;
}) {
  const tones = {
    neutral: "border-border-subtle bg-surface-sunken text-text-secondary",
    warning: "border-warning-border bg-warning-soft text-warning-fg",
    primary: "border-primary-border bg-primary-soft text-primary",
  } as const;
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-6",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
