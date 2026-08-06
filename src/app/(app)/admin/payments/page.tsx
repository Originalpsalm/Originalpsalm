import Link from "next/link";
import { listPayments } from "@/lib/admin";
import { approvePaymentAction, rejectPaymentAction } from "@/actions/admin";
import { Badge, Button, cn, inputClass, naira } from "@/components/ui";

type Props = { searchParams: Promise<{ status?: string }> };

const STATUSES = ["all", "pending", "success", "failed"];

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status ?? "") ? status! : "all";
  const payments = listPayments(active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((entry) => (
          <Link
            key={entry}
            href={entry === "all" ? "/admin/payments" : `/admin/payments?status=${entry}`}
            className={cn(
              "focus-ring rounded-full border px-3 py-1 text-xs font-semibold capitalize transition",
              active === entry
                ? "border-leaf-500/45 bg-leaf-500/12 text-leaf-400"
                : "border-leaf-500/12 text-mist hover:text-chalk",
            )}
          >
            {entry}
          </Link>
        ))}
      </div>

      <p className="text-xs text-mist">
        A pending payment is usually a checkout somebody started and abandoned — no money moved.
        Approve one only when you have confirmed the money arrived in your Paystack dashboard.
      </p>

      {payments.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          No {active === "all" ? "" : active} payments to show.
        </p>
      ) : (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li key={payment.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-extrabold tabular-nums">
                  {naira(payment.amount_kobo / 100)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/users/${payment.user_id}`}
                    className="focus-ring block truncate rounded text-sm font-semibold hover:text-leaf-400"
                  >
                    {payment.user_name}
                  </Link>
                  <p className="truncate text-xs text-mist">{payment.user_email}</p>
                </div>
                <div className="text-right text-xs text-mist">
                  <p className="font-mono">{payment.reference}</p>
                  <p>
                    {payment.months} month{payment.months === 1 ? "" : "s"} ·{" "}
                    {payment.provider} · {payment.created_at.slice(0, 16)}
                  </p>
                </div>
                <Badge
                  tone={
                    payment.status === "success" ? "leaf" : payment.status === "failed" ? "red" : "mist"
                  }
                >
                  {payment.status}
                </Badge>
              </div>

              {payment.status === "pending" && (
                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-leaf-500/10 pt-3">
                  <form action={approvePaymentAction} className="flex flex-1 items-end gap-2">
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <label className="min-w-[200px] flex-1 text-xs text-mist">
                      Why are you approving this by hand?
                      <input
                        name="note"
                        maxLength={140}
                        placeholder="Confirmed in Paystack dashboard, ref 4829…"
                        className={inputClass + " mt-1 px-3 py-1.5 text-sm"}
                      />
                    </label>
                    <Button size="sm" variant="gold">
                      Approve and unlock premium
                    </Button>
                  </form>
                  <form action={rejectPaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <Button size="sm" variant="ghost">
                      Mark failed
                    </Button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
