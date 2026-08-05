import { Check, Crown, Info, ShieldCheck } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { PLANS, isMockBilling, paymentsFor } from "@/lib/billing";
import { Badge, ButtonLink, naira } from "@/components/ui";
import { Checkout } from "./Checkout";

export const metadata = { title: "Premium" };

const PERKS = [
  "Every question in every past paper — not just the first five",
  "Full worked explanations on every single question",
  "Unlimited timed mock exams under CBT conditions",
  "Topic-by-topic breakdown of where you lose marks",
  "New papers added every term at no extra cost",
  "Cancel anytime — nothing renews without you",
];

export default async function PremiumPage() {
  const user = await requireUser();
  const premium = isPremium(user);
  const payments = paymentsFor(user.id);

  const expires = user.plan_expires_at
    ? new Date(user.plan_expires_at.replace(" ", "T") + "Z")
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="animate-rise text-center">
        <Badge tone="gold">
          <Crown size={12} /> GURU Premium
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {premium ? "You are on Premium" : "Open every past question"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-mist">
          {premium
            ? "Everything is unlocked. Keep grinding — your exam is not going to write itself."
            : "One subscription, every paper, every explanation. Less than what you spend on data in a week."}
        </p>
      </header>

      {/* ------------------------------------------------ active status --- */}
      {premium && expires && (
        <section className="card p-6 text-center">
          <ShieldCheck size={26} className="mx-auto text-leaf-400" />
          <p className="mt-3 text-sm text-mist">Your subscription runs until</p>
          <p className="mt-1 text-xl font-bold">
            {expires.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-3 text-xs text-mist">
            You can extend it any time below — added months stack on top of the days you have left.
          </p>
        </section>
      )}

      {/* ---------------------------------------------------------- perks --- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-bold">What you get</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex gap-2.5 text-sm text-mist">
              <Check size={17} className="mt-0.5 shrink-0 text-gold-400" />
              {perk}
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------- checkout --- */}
      <Checkout plans={[...PLANS]} isMock={isMockBilling} premium={premium} />

      {isMockBilling && (
        <div className="surface flex gap-3 p-4 text-sm text-mist">
          <Info size={17} className="mt-0.5 shrink-0 text-gold-400" />
          <p>
            <span className="font-semibold text-chalk">Test mode.</span> No Paystack keys are
            configured, so checkout runs against a local simulator and no money moves. Add{" "}
            <code className="rounded bg-ink-900 px-1.5 py-0.5 text-xs">PAYSTACK_SECRET_KEY</code>{" "}
            to <code className="rounded bg-ink-900 px-1.5 py-0.5 text-xs">.env.local</code> to take
            real payments.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------- history --- */}
      {payments.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Payment history</h2>
          <div className="card divide-y divide-leaf-500/8">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {naira(payment.amount_kobo / 100)}{" "}
                    <span className="text-mist">
                      · {payment.months} {payment.months === 1 ? "month" : "months"}
                    </span>
                  </p>
                  <p className="truncate font-mono text-xs text-mist/70">{payment.reference}</p>
                </div>
                <Badge
                  tone={
                    payment.status === "success" ? "leaf" : payment.status === "failed" ? "red" : "mist"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs leading-relaxed text-mist/70">
        Payments are processed by Paystack. GURU never sees or stores your card details. Because
        every account is limited to one student at a time, we can keep this price low for everybody.
      </p>

      {premium && (
        <p className="text-center">
          <ButtonLink href="/practice" variant="ghost">
            Go and practise
          </ButtonLink>
        </p>
      )}
    </div>
  );
}
