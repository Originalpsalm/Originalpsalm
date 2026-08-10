"use client";

import { useState } from "react";
import { cn } from "./ui";

/**
 * The GURU mark: a graduation-cap silhouette formed from a "G".
 * Drawn inline so it stays crisp at any size and costs no extra request. This
 * is the fallback whenever no custom logo has been uploaded.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const [customFailed, setCustomFailed] = useState(false);

  // A logo uploaded in the admin panel is served from /api/brand/logo. We try
  // it first and quietly fall back to the built-in mark if none exists (the
  // route 404s), so a fresh install still shows something sensible.
  if (!customFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/api/brand/logo"
        alt="GURU"
        width={size}
        height={size}
        onError={() => setCustomFailed(true)}
        className={cn("rounded-[28%] object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="guru-mark" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ddc97" />
          <stop offset="0.55" stopColor="#17c471" />
          <stop offset="1" stopColor="#0b8f57" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#guru-mark)" />
      {/* mortar board */}
      <path d="M24 12 8 19l16 7 16-7-16-7Z" fill="#04170f" />
      {/* the tassel + the open side of the G */}
      <path d="M38 21v8" stroke="#04170f" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M14 23v6.5c0 3.6 4.5 6.5 10 6.5s10-2.9 10-6.5V23"
        stroke="#04170f"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  showWord = true,
  className,
}: {
  size?: number;
  showWord?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {showWord && (
        <span
          className="font-extrabold tracking-tight"
          style={{ fontSize: size * 0.62, letterSpacing: "-0.02em" }}
        >
          GURU
        </span>
      )}
    </span>
  );
}
