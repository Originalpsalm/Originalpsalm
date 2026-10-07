import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { Landing } from "@/components/landing/Landing";
import { getCurrentUser } from "@/lib/auth";
import { PREMIUM_PRICE_NAIRA, planFor } from "@/lib/billing";
import { freeYears, speedTiers } from "@/lib/content-rules";

/** The public site is always green on white, whatever theme the app is in. */
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  // The copy quotes the live rules — free years, Speed Mode tiers and prices
  // all come from the same place the app reads them, so an admin change never
  // leaves the website out of date.
  return (
    <Landing
      freeYears={freeYears()}
      tiers={speedTiers()}
      prices={{
        monthly: PREMIUM_PRICE_NAIRA,
        threeMonths: planFor("3").naira,
        sixMonths: planFor("6").naira,
      }}
    />
  );
}
