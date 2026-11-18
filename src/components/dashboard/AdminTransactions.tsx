"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2, ReceiptText } from "lucide-react";
import { fetchPayments } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Payment } from "@/lib/types";
import StatCard from "@/components/dashboard/StatCard";
import PaymentBadge from "@/components/dashboard/PaymentBadge";
import EmptyState from "@/components/shared/EmptyState";

/**
 * Admin "Transactions": every Stripe payment record on the platform, with
 * the aggregated total revenue at the top.
 */
export default function AdminTransactions() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPayments().then((list) => {
      if (cancelled) return;
      setPayments(
        [...list].sort(
          (a, b) =>
            new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime()
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (payments === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading transactions…
      </div>
    );
  }

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All Stripe payments recorded on the platform (USD).
        </p>
      </div>

      {/* Revenue summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={Coins} label="Total Platform Revenue" value={formatPrice(totalRevenue)} />
        <StatCard
          icon={ReceiptText}
          label="Transactions"
          value={payments.length}
          iconClassName="bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6]"
        />
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Coins}
          title="No transactions yet"
          description="Payments made by customers after job completion will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Customer</th>
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
                  <td className="max-w-52 truncate px-4 py-3 font-semibold">
                    {payment.serviceTitle ?? "—"}
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                    {payment.customerName ?? payment.customerEmail ?? "—"}
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
      )}
    </div>
  );
}
