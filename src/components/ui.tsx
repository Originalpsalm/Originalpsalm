import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

// ------------------------------------------------------------------- avatar

/**
 * Initials on a colour derived from the user's stored hue — so every classmate
 * looks distinct even without a photo. When the user has uploaded a profile
 * picture (`userId` + `avatarVersion > 0`), it is layered on top; if that image
 * ever fails to load, the initials underneath simply show through, so no
 * JavaScript or error handling is needed for the fallback.
 */
export function Avatar({
  name,
  hue,
  size = 40,
  className,
  userId,
  avatarVersion = 0,
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
  userId?: number;
  avatarVersion?: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const hasPhoto = userId != null && avatarVersion > 0;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-brandink select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 75% 45%))`,
      }}
      aria-hidden="true"
    >
      {initials || "?"}
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/avatar/${userId}?v=${avatarVersion}`}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  );
}

// ------------------------------------------------------------------ buttons

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition " +
  "focus-ring disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]";

const variants = {
  primary: "brand-gradient text-brandink shadow-lg shadow-leaf-700/25 hover:brightness-110",
  ghost: "border border-leaf-500/20 text-chalk hover:border-leaf-500/45 hover:bg-leaf-500/10",
  gold: "bg-gold-500 text-brandink hover:bg-gold-400 shadow-lg shadow-gold-500/20",
  danger: "border border-red-500/30 text-red-300 hover:bg-red-500/10",
  subtle: "text-mist hover:text-chalk",
} as const;

const sizes = {
  sm: "px-3.5 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function buttonClass({ variant = "primary", size = "md" }: ButtonStyleProps = {}) {
  return cn(buttonBase, variants[variant], sizes[size]);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return <button className={cn(buttonClass({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={cn(buttonClass({ variant, size }), className)} {...props} />;
}

// ------------------------------------------------------------------- fields

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-mist/75">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-leaf-500/15 bg-ink-900/70 px-4 py-3 text-chalk " +
  "placeholder:text-mist/50 transition focus-ring focus:border-leaf-500/50";

// ------------------------------------------------------------------ badges

export function Badge({
  children,
  tone = "leaf",
  className,
}: {
  children: ReactNode;
  tone?: "leaf" | "gold" | "mist" | "red";
  className?: string;
}) {
  const tones = {
    leaf: "bg-leaf-500/12 text-leaf-400 border-leaf-500/25",
    gold: "bg-gold-500/12 text-gold-400 border-gold-500/30",
    mist: "bg-white/5 text-mist border-white/10",
    red: "bg-red-500/10 text-red-300 border-red-500/25",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ------------------------------------------------------------------- alerts

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "border-red-500/25 bg-red-500/10 text-red-200",
    success: "border-leaf-500/25 bg-leaf-500/10 text-leaf-400",
    info: "border-gold-500/25 bg-gold-500/10 text-gold-400",
  } as const;
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])} role="status">
      {children}
    </div>
  );
}

// --------------------------------------------------------------- empty state

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-leaf-500/10 text-leaf-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-mist">{body}</p>
      {action}
    </div>
  );
}

// ------------------------------------------------------------------- naira

/** ₦ with thousands separators — used everywhere money is shown. */
export function naira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG");
}
