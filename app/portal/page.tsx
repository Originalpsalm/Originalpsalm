import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { PortalPreview } from "@/components/portal/portal-preview";

export const metadata: Metadata = {
  title: "Investor room",
  description:
    "A preview of the reporting environment Green-X Farm participants receive — positions, cycle KPIs, weekly updates and the document room.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <>
      <PageHero
        eyebrow="Investor room"
        title="The reporting you receive, before you commit anything."
        lead="Participants get weekly cost and crop records through the cycle, milestone evidence at key stages, and a full production and financial report at close-out. This is what that looks like."
      />
      <PortalPreview />
    </>
  );
}
