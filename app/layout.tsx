import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { site } from "@/content/site";

import "./globals.css";

/*
 * Fonts are self-hosted rather than fetched from Google at build time.
 *
 * next/font/google downloads the files during every build, which makes the
 * build fail whenever the network to Google is unavailable — it has already
 * broken CI once. These are the same latin-subset variable files, committed to
 * the repo, so the build has no network dependency and readers are not sent to
 * a third party on page load. Both faces are SIL Open Font License 1.1; see
 * app/fonts/OFL.txt.
 */
const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const display = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-display",
  weight: "200 800",
  style: "normal",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Investor Platform`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — Investor Platform`,
    description: site.description,
    type: "website",
    locale: "en_NG",
    siteName: site.name,
  },
};

/**
 * Applies the stored theme before first paint so the page never flashes the
 * wrong palette. Kept deliberately tiny and dependency-free.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('gx-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-fg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
