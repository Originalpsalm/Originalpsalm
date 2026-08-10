import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { paymentByReference, verifyAndActivate } from "@/lib/billing";

/**
 * Paystack calls this the moment a charge succeeds, independent of whatever
 * the student's browser does next. Without it, a payment whose redirect is
 * lost (data cut out, app closed at the bank page) sits as "pending" until an
 * admin approves it by hand.
 *
 * Authenticity: Paystack signs the raw body with HMAC-SHA512 using the secret
 * key and sends the digest in x-paystack-signature. Anything unsigned or
 * mis-signed is discarded before touching the database. On top of that,
 * verifyAndActivate re-confirms the reference against Paystack's API and
 * checks the amount, so even a forged signed event cannot grant more than
 * what was genuinely paid.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");

  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event !== "charge.success" || !event.data?.reference) {
    // Not ours to handle; acknowledge so Paystack stops retrying.
    return NextResponse.json({ received: true });
  }

  const payment = paymentByReference(event.data.reference);
  if (!payment) {
    // A reference we never issued — acknowledge and ignore.
    return NextResponse.json({ received: true });
  }

  // Idempotent: verifyAndActivate short-circuits if already succeeded, so the
  // callback page and this webhook can both fire without double-crediting.
  await verifyAndActivate(event.data.reference);
  return NextResponse.json({ received: true });
}
