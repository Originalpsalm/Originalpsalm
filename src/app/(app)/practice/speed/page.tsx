import { Crown, Timer, Zap } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { subjectsWithCounts } from "@/lib/queries";
import { speedTiers } from "@/lib/content-rules";
import { Badge } from "@/components/ui";
import { SpeedPicker } from "./SpeedPicker";

export const metadata = { title: "Speed Mode" };

type Props = { searchParams: Promise<{ tooFew?: string }> };

export default async function SpeedModePage({ searchParams }: Props) {
  const { tooFew } = await searchParams;
  const user = await requireUser();
  const premium = isPremium(user);
  const subjects = subjectsWithCounts();
  const tiers = speedTiers();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="animate-rise">
        <Badge tone="gold">
          <Zap size={12} /> Speed Mode
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Beat the clock</h1>
        <p className="mt-2 text-mist">
          A random mix of questions under real exam timing. Pick a length and a subject, then go. It
          builds your speed and shows where you slow down.
        </p>
      </header>

      {tooFew === "1" && (
        <div className="surface p-4 text-sm text-mist">
          There aren&apos;t enough questions for that choice yet. Try &quot;Mixed&quot; or a
          different subject — more get added over time.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.count} className="card p-4 text-center">
            <p className="text-3xl font-extrabold tabular-nums">{tier.count}</p>
            <p className="text-xs text-mist">questions</p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-mist">
              <Timer size={12} /> {tier.minutes} min
            </p>
            {tier.premium && !premium && (
              <Badge tone="gold" className="mt-2">
                <Crown size={10} /> Premium
              </Badge>
            )}
          </div>
        ))}
      </div>

      <SpeedPicker subjects={subjects} premium={premium} tiers={tiers} />
    </div>
  );
}
