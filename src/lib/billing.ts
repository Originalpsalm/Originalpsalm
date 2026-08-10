import crypto from "node:crypto";
import { db } from "./db";

export const PREMIUM_PRICE_NAIRA = Number(process.env.PREMIUM_PRICE_NAIRA ?? 2000);
export const PREMIUM_PRICE_KOBO = PREMIUM_PRICE_NAIRA * 100;

/** Plans a student can pick. Longer plans carry a discount. */
export const PLANS = [
  { id: "1", months: 1, label: "Monthly", naira: PREMIUM_PRICE_NAIRA, note: null },
  {
    id: "3",
    months: 3,
    label: "3 months",
    naira: PREMIUM_PRICE_NAIRA * 3 - 500,
    note: "Save ₦500",
  },
  {
    id: "6",
    months: 6,
    label: "6 months",
    naira: PREMIUM_PRICE_NAIRA * 6 - 2000,
    note: "Save ₦2,000 — covers a full exam term",
  },
] as const;

export function planFor(id: string) {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

/**
 * With no Paystack secret configured, the subscription flow runs against a
 * local stub — but ONLY off production. Left on for a deployed site, the stub
 * would be a free-premium button for anyone who found it, so in production
 * missing keys mean payments are simply disabled until they are added.
 * (ALLOW_MOCK_BILLING=1 exists for staging environments that want the stub.)
 */
export const isMockBilling =
  !PAYSTACK_SECRET &&
  (process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_BILLING === "1");

/** True when neither real keys nor the (permitted) stub are available. */
export const isBillingDisabled = !PAYSTACK_SECRET && !isMockBilling;

export function newReference(): string {
  return "guru_" + crypto.randomBytes(9).toString("hex");
}

export type InitResult =
  | { ok: true; authorizationUrl: string; reference: string }
  | { ok: false; error: string };

export async function initializePayment(input: {
  userId: number;
  email: string;
  planId: string;
}): Promise<InitResult> {
  if (isBillingDisabled) {
    return {
      ok: false,
      error:
        "Payments are not switched on yet. Practice stays free — check back soon for Premium.",
    };
  }
  const plan = planFor(input.planId);
  const reference = newReference();
  const amountKobo = plan.naira * 100;

  db.prepare(
    `INSERT INTO payments (user_id, reference, amount_kobo, provider, status, months)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
  ).run(input.userId, reference, amountKobo, isMockBilling ? "mock" : "paystack", plan.months);

  if (isMockBilling) {
    return { ok: true, authorizationUrl: `/premium/mock-checkout?ref=${reference}`, reference };
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: amountKobo,
        reference,
        currency: "NGN",
        callback_url: `${base}/premium/verify`,
        metadata: { user_id: input.userId, months: plan.months, product: "GURU Premium" },
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string };
    };

    if (!response.ok || !payload.status || !payload.data?.authorization_url) {
      return { ok: false, error: payload.message ?? "Could not reach Paystack. Please try again." };
    }
    return { ok: true, authorizationUrl: payload.data.authorization_url, reference };
  } catch {
    return { ok: false, error: "Network error while starting the payment. Please try again." };
  }
}

export type PaymentRow = {
  id: number;
  user_id: number;
  reference: string;
  amount_kobo: number;
  provider: string;
  status: string;
  months: number;
  created_at: string;
  verified_at: string | null;
};

export function paymentByReference(reference: string): PaymentRow | undefined {
  return db.prepare(`SELECT * FROM payments WHERE reference = ?`).get(reference) as
    | PaymentRow
    | undefined;
}

export function paymentsFor(userId: number): PaymentRow[] {
  return db
    .prepare(`SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 20`)
    .all(userId) as PaymentRow[];
}

/**
 * Confirms a payment and unlocks premium.
 *
 * Verification always goes back to Paystack rather than trusting anything the
 * browser sends — a student could otherwise hit the callback URL by hand and
 * award themselves a subscription.
 */
export async function verifyAndActivate(
  reference: string,
): Promise<{ ok: true; months: number } | { ok: false; error: string }> {
  const payment = paymentByReference(reference);
  if (!payment) return { ok: false, error: "We could not find that payment." };
  if (payment.status === "success") return { ok: true, months: payment.months };

  // A stub payment can only complete where the stub itself is permitted —
  // records created while testing must not unlock anything on production.
  if (payment.provider === "mock" && !isMockBilling) {
    return { ok: false, error: "That test payment cannot be used here." };
  }

  if (payment.provider !== "mock") {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }, cache: "no-store" },
      );
      const payload = (await response.json()) as {
        status?: boolean;
        data?: { status?: string; amount?: number };
      };

      const succeeded = payload.status && payload.data?.status === "success";
      const amountMatches = payload.data?.amount === payment.amount_kobo;

      if (!succeeded || !amountMatches) {
        db.prepare(`UPDATE payments SET status = 'failed' WHERE id = ?`).run(payment.id);
        return {
          ok: false,
          error: succeeded
            ? "The amount paid did not match this subscription."
            : "That payment was not completed.",
        };
      }
    } catch {
      return { ok: false, error: "We could not confirm the payment with Paystack. Try again." };
    }
  }

  activatePremium(payment.user_id, payment.months);
  db.prepare(
    `UPDATE payments SET status = 'success', verified_at = datetime('now') WHERE id = ?`,
  ).run(payment.id);
  return { ok: true, months: payment.months };
}

/** Extends an existing subscription rather than overwriting unused days. */
export function activatePremium(userId: number, months: number) {
  db.prepare(
    `UPDATE users
        SET plan = 'premium',
            plan_expires_at = datetime(
              CASE
                WHEN plan_expires_at IS NOT NULL AND plan_expires_at > datetime('now')
                THEN plan_expires_at
                ELSE datetime('now')
              END,
              '+' || ? || ' months'
            )
      WHERE id = ?`,
  ).run(months, userId);
}
