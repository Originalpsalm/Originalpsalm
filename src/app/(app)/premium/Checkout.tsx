"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { startCheckoutAction, type CheckoutState } from "@/actions/billing";
import { Alert, Badge, Button, cn, naira } from "@/components/ui";

type Plan = {
  id: string;
  months: number;
  label: string;
  naira: number;
  note: string | null;
};

function PayButton({ amount, premium }: { amount: number; premium: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : null}
      {pending
        ? "Opening secure checkout…"
        : `${premium ? "Extend" : "Pay"} ${naira(amount)}`}
    </Button>
  );
}

export function Checkout({
  plans,
  isMock,
  premium,
}: {
  plans: Plan[];
  isMock: boolean;
  premium: boolean;
}) {
  const [selected, setSelected] = useState(plans[0].id);
  const [state, action] = useActionState<CheckoutState, FormData>(startCheckoutAction, {});
  const plan = plans.find((entry) => entry.id === selected) ?? plans[0];

  return (
    <form action={action} className="card p-6 sm:p-8">
      <input type="hidden" name="planId" value={selected} />

      <h2 className="text-lg font-bold">Choose how long</h2>
      <p className="mt-1 text-sm text-mist">Longer plans cost less per month.</p>

      {state.error && (
        <div className="mt-4">
          <Alert>{state.error}</Alert>
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        {plans.map((entry) => {
          const active = entry.id === selected;
          const perMonth = Math.round(entry.naira / entry.months);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelected(entry.id)}
              aria-pressed={active}
              className={cn(
                "focus-ring flex w-full items-center gap-4 rounded-xl border p-4 text-left transition",
                active
                  ? "border-gold-500/55 bg-gold-500/10"
                  : "border-leaf-500/12 bg-ink-900/40 hover:border-leaf-500/30",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
                  active ? "border-gold-400" : "border-mist/40",
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-gold-400" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{entry.label}</span>
                  {entry.note && <Badge tone="gold">{entry.note}</Badge>}
                </span>
                <span className="mt-0.5 block text-xs text-mist">
                  {naira(perMonth)} per month
                </span>
              </span>

              <span className="shrink-0 text-lg font-extrabold tabular-nums">
                {naira(entry.naira)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <PayButton amount={plan.naira} premium={premium} />
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-mist">
        <ShieldCheck size={14} className="text-leaf-400" />
        {isMock
          ? "Test checkout — no real charge"
          : "Secured by Paystack · card, transfer & USSD"}
      </p>
    </form>
  );
}
