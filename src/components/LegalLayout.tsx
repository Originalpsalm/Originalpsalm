import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

/** Shared, readable layout for the Terms and Privacy pages. Public (no auth). */
export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link
        href="/"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> Back to GURU
      </Link>

      <div className="mt-6">
        <Logo size={30} />
      </div>

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-chalk">{title}</h1>
      <p className="mt-2 text-sm text-mist">Last updated: {updated}</p>
      <p className="mt-5 text-[0.95rem] leading-relaxed text-mist">{intro}</p>

      <div className="mt-8 space-y-8">{children}</div>

      <footer className="mt-14 border-t border-leaf-500/10 pt-6 text-xs text-mist/70">
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="focus-ring rounded hover:text-chalk">
            Terms of Service
          </Link>
          <Link href="/privacy" className="focus-ring rounded hover:text-chalk">
            Privacy Policy
          </Link>
          <Link href="/" className="focus-ring rounded hover:text-chalk">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3 text-[0.95rem] leading-relaxed text-mist">
      <h2 className="text-lg font-bold text-chalk">{heading}</h2>
      {children}
    </section>
  );
}
