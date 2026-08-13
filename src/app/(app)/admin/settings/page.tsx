import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { isOwner, requireAdmin } from "@/lib/auth";
import { freeYears } from "@/lib/content-rules";
import { PREMIUM_PRICE_NAIRA } from "@/lib/billing";
import { naira } from "@/components/ui";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const actor = await requireAdmin();
  if (!isOwner(actor)) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <SlidersHorizontal size={20} className="text-leaf-400" /> Settings
        </h2>
        <p className="mt-1 text-sm text-mist">Controls that shape the free and premium tiers.</p>
      </div>

      <SettingsForm current={freeYears()} />

      <div className="surface p-4 text-xs leading-relaxed text-mist">
        <p className="font-semibold text-chalk">How the free tier works</p>
        <p className="mt-1">
          Free students get the most recent years of every subject, in full. Everything older is
          Premium. As you add newer years, the boundary moves by itself — you never re-tag old
          questions.
        </p>
        <p className="mt-2 font-semibold text-chalk">Premium price</p>
        <p className="mt-1">
          Currently {naira(PREMIUM_PRICE_NAIRA)}/month, set with the{" "}
          <code className="rounded bg-ink-900 px-1 py-0.5">PREMIUM_PRICE_NAIRA</code> variable in
          Railway. Ask me if you want to change it or add discount plans.
        </p>
      </div>
    </div>
  );
}
