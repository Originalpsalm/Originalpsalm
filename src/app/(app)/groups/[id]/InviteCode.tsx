"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** The invite code plus a one-tap copy — how classmates actually get added. */
export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // clipboard blocked; the code is on screen anyway
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="surface shrink-0 p-3 text-center">
      <p className="text-[11px] uppercase tracking-wider text-mist">Invite code</p>
      <p className="mt-1 font-mono text-xl font-bold tracking-[0.2em] text-leaf-400">{code}</p>
      <button
        type="button"
        onClick={copy}
        className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-mist transition hover:text-chalk"
      >
        {copied ? <Check size={13} className="text-leaf-400" /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy code"}
      </button>
    </div>
  );
}
