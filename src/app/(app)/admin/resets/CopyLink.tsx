"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/components/ui";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard blocked; the URL is on screen either way */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "focus-ring group flex min-w-0 max-w-full flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition",
        copied
          ? "border-leaf-500/45 bg-leaf-500/10 text-leaf-400"
          : "border-leaf-500/15 bg-ink-900/60 text-mist hover:text-chalk",
      )}
      aria-label={copied ? "Reset link copied" : "Copy reset link"}
    >
      {copied ? <Check size={14} className="shrink-0" /> : <Copy size={14} className="shrink-0" />}
      <span className="min-w-0 flex-1 truncate font-mono">{link}</span>
      <span className="shrink-0 text-[10px] uppercase tracking-wider opacity-70">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
