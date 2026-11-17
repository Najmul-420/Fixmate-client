"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Loader2, ReceiptText } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { fetchPayments } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Payment } from "@/lib/types";
import PaymentBadge from "@/components/dashboard/PaymentBadge";
import EmptyState from "@/components/shared/EmptyState";

/**
 * Customer "Payment History": every Stripe payment the signed-in customer
 * made, scoped by email from the session.
 */
export default function PaymentHistory() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    fetchPayments().then((all) => {
      if (cancelled) return;
      const mine = all
        .filter(
          (payment) =>
            !payment.customerEmail ||
            payment.customerEmail.toLowerCase() === email.toLowerCase()
        )
        .sort(
          (a, b) =>
            new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime()
        );
      setPayments(mine);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (isPending || !email || payments === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your payment history…
      </div>
    );
  }

  const totalPaid = payments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All payments you have made through FixMate (Stripe, USD).
          </p>
        </div>
        {payments.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total paid:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {formatPrice(totalPaid)}
            </span>
          </p>
        )}
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No payments yet"
          description="Payments appear here after you pay for a completed repair job via Stripe Checkout."
          action={{ label: "View My Bookings", href: "/dashboard/customer/bookings" }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Paid On</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b last:border-0">
                    <td className="max-w-56 truncate px-4 py-3 font-semibold">
                      {payment.serviceTitle ?? "—"}
                    </td>
                    <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                      {payment.technicianName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="max-w-40 truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                      {payment.transactionId ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={payment.paymentStatus ?? "paid"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {payments.map((payment) => (
              <li key={payment._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{payment.serviceTitle ?? "Payment"}</p>
                  <PaymentBadge status={payment.paymentStatus ?? "paid"} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Technician</dt>
                  <dd className="truncate">{payment.technicianName ?? "—"}</dd>
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatPrice(payment.amount)}
                  </dd>
                  <dt className="text-muted-foreground">Paid On</dt>
                  <dd>{formatDate(payment.paidAt)}</dd>
                  <dt className="text-muted-foreground">Transaction</dt>
                  <dd className="truncate font-mono text-xs text-muted-foreground">
                    {payment.transactionId ?? "—"}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleCheck className="size-3.5 text-primary" />
            {payments.length} payment{payments.length === 1 ? "" : "s"} recorded
          </p>
        </>
      )}
    </div>
  );
}
