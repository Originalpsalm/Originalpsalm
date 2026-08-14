import { notFound } from "next/navigation";
import { SlidersHorizontal, Timer } from "lucide-react";
import { isOwner, requireAdmin } from "@/lib/auth";
import { freeYears, speedTiers } from "@/lib/content-rules";
import { PREMIUM_PRICE_NAIRA } from "@/lib/billing";
import { naira } from "@/components/ui";
import { FreeYearsForm } from "./FreeYearsForm";
import { SpeedTiersForm } from "./SpeedTiersForm";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const actor = await requireAdmin();
  if (!isOwner(actor)) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <SlidersHorizontal size={20} className="text-leaf-400" /> Settings
        </h2>
        <p className="mt-1 text-sm text-mist">Controls that shape the free and premium tiers.</p>
      </div>

      {/* -------------------------------------------------- free years --- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-mist">Free tier</h3>
        <FreeYearsForm current={freeYears()} />
        <div className="surface p-4 text-xs leading-relaxed text-mist">
          Free students get the most recent years of every subject, in full. Everything older is
          Premium. As you add newer years, the boundary moves by itself — you never re-tag old
          questions.
        </div>
      </section>

      {/* -------------------------------------------------- speed tiers --- */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-mist">
          <Timer size={14} className="text-leaf-400" /> Speed Mode lengths &amp; timers
        </h3>
        <p className="text-xs text-mist">
          Choose how many questions each timed test has, how many minutes are on the clock, and
          whether it needs Premium. Add as many as you like — set free ones to 20, 30, whatever you
          want.
        </p>
        <SpeedTiersForm tiers={speedTiers()} />
      </section>

      {/* ----------------------------------------------------- pricing --- */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-mist">Premium price</h3>
        <div className="surface p-4 text-xs leading-relaxed text-mist">
          Currently {naira(PREMIUM_PRICE_NAIRA)}/month, set with the{" "}
          <code className="rounded bg-ink-900 px-1 py-0.5">PREMIUM_PRICE_NAIRA</code> variable in
          Railway. Ask me if you want to change it or add discount plans.
        </div>
      </section>
    </div>
  );
}
