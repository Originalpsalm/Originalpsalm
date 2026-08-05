import { CircleCheckBig, CircleX } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { paymentByReference, verifyAndActivate } from "@/lib/billing";
import { ButtonLink } from "@/components/ui";

export const metadata = { title: "Confirming payment" };

type Props = { searchParams: Promise<{ reference?: string; trxref?: string }> };

/**
 * Where Paystack sends the student after checkout. The reference is confirmed
 * with Paystack here before premium is granted — the browser is never trusted.
 */
export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await requireUser();
  const reference = params.reference ?? params.trxref ?? "";

  const payment = reference ? paymentByReference(reference) : undefined;
  const owned = payment?.user_id === user.id;

  const result = owned
    ? await verifyAndActivate(reference)
    : ({ ok: false, error: "We could not find that payment on your account." } as const);

  return (
    <div className="mx-auto grid max-w-md place-items-center py-12">
      <div className="card w-full p-8 text-center">
        {result.ok ? (
          <>
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-leaf-500/12 text-leaf-400 animate-ping-ring">
              <CircleCheckBig size={30} />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">You are Premium 🎉</h1>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              {result.months} {result.months === 1 ? "month" : "months"} added to your account.
              Every question in every paper is now open, with the full working on each one.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <ButtonLink href="/practice" size="lg">
                Start a full paper
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="ghost">
                Back to home
              </ButtonLink>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-500/12 text-red-300">
              <CircleX size={30} />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Payment not confirmed</h1>
            <p className="mt-3 text-sm leading-relaxed text-mist">{result.error}</p>
            <p className="mt-2 text-xs text-mist/70">
              If money left your account, nothing is lost — send us the reference{" "}
              <span className="font-mono">{reference || "—"}</span> and it will be sorted.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <ButtonLink href="/premium" size="lg">
                Try again
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="ghost">
                Back to home
              </ButtonLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
