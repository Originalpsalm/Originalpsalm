import Link from "next/link";
import { notFound } from "next/navigation";
import { CreditCard, TriangleAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { paymentByReference } from "@/lib/billing";
import { completeMockPaymentAction } from "@/actions/billing";
import { Button, naira } from "@/components/ui";

export const metadata = { title: "Test checkout" };

type Props = { searchParams: Promise<{ ref?: string }> };

/**
 * A stand-in for the Paystack checkout page, used only while no live keys are
 * configured. It lets the whole subscription journey be walked end to end.
 */
export default async function MockCheckoutPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const user = await requireUser();
  const payment = ref ? paymentByReference(ref) : undefined;

  if (!payment || payment.user_id !== user.id || payment.provider !== "mock") notFound();

  return (
    <div className="mx-auto grid max-w-md place-items-center py-10">
      <div className="card w-full p-7">
        <div className="flex items-center gap-2 rounded-xl border border-gold-500/25 bg-gold-500/10 px-3 py-2 text-xs text-gold-400">
          <TriangleAlert size={14} className="shrink-0" />
          Test mode — this is a simulator, not Paystack. No money moves.
        </div>

        <div className="mt-6 text-center">
          <CreditCard size={28} className="mx-auto text-leaf-400" />
          <h1 className="mt-4 text-xl font-bold">Confirm your payment</h1>
          <p className="mt-1 text-sm text-mist">GURU Premium</p>
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-mist">Amount</dt>
            <dd className="font-bold">{naira(payment.amount_kobo / 100)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Duration</dt>
            <dd>
              {payment.months} {payment.months === 1 ? "month" : "months"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Email</dt>
            <dd className="truncate pl-4">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Reference</dt>
            <dd className="truncate pl-4 font-mono text-xs">{payment.reference}</dd>
          </div>
        </dl>

        <form action={completeMockPaymentAction} className="mt-7">
          <input type="hidden" name="reference" value={payment.reference} />
          <Button variant="gold" size="lg" className="w-full">
            Pay {naira(payment.amount_kobo / 100)}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/premium" className="focus-ring rounded text-mist hover:text-chalk">
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}
