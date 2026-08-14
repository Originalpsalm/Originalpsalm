import type { Metadata, Viewport } from "next";
import "./globals.css";
import { themeBootScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: {
    default: "GURU — Pass WAEC, JAMB & NECO",
    template: "%s · GURU",
  },
  description:
    "Past questions for WAEC, JAMB, NECO and NABTEB with worked answers, study groups with your classmates, and progress tracking. Built for Nigerian students.",
  applicationName: "GURU",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "GURU", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "GURU — Pass WAEC, JAMB & NECO",
    description:
      "Past questions with worked answers, study groups, and progress tracking for Nigerian students.",
    siteName: "GURU",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050d0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before paint, so there is no colour flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
