"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializePayment, paymentByReference } from "@/lib/billing";
import { LIMITS, allow } from "@/lib/rate-limit";

export type CheckoutState = { error?: string };

export async function startCheckoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await requireUser();
  const planId = String(formData.get("planId") ?? "1");

  // Per-user throttle so a script can't spam Paystack init and flood the
  // payments table with pending rows.
  if (!allow(`payment:${user.id}`, LIMITS.payment.max, LIMITS.payment.windowMs)) {
    return { error: "Too many checkout attempts. Please wait a little and try again." };
  }

  const result = await initializePayment({
    userId: user.id,
    email: user.email,
    planId,
  });

  if (!result.ok) return { error: result.error };
  redirect(result.authorizationUrl);
}

/**
 * Stands in for the Paystack checkout page while no live keys are configured.
 * It only ever marks the *local* record as paid — the real flow still verifies
 * against Paystack before anything is unlocked.
 */
export async function completeMockPaymentAction(formData: FormData) {
  const user = await requireUser();
  const reference = String(formData.get("reference") ?? "");
  const payment = paymentByReference(reference);

  if (!payment || payment.user_id !== user.id || payment.provider !== "mock") {
    redirect("/premium");
  }

  db.prepare(`UPDATE payments SET status = 'pending' WHERE id = ?`).run(payment.id);
  redirect(`/premium/verify?reference=${encodeURIComponent(reference)}`);
}
