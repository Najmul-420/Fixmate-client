"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  CircleCheck,
  Loader2,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { fetchBookings, fetchPayments } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ACTIVE_BOOKING_STATUSES, type Booking, type Payment } from "@/lib/types";

/**
 * Customer dashboard overview: total requests, active jobs, completed
 * services and total spent — computed live from the API (no demo data).
 */
export default function CustomerOverview() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    setBookings(null);
    setPayments(null);
    Promise.all([fetchBookings({ customerEmail: email }), fetchPayments()])
      .then(([bookingList, paymentList]) => {
        if (!cancelled) {
          setBookings(bookingList);
          setPayments(
            paymentList.filter(
              (payment) =>
                !payment.customerEmail ||
                payment.customerEmail.toLowerCase() === email.toLowerCase()
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBookings([]);
          setPayments([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (isPending || !email || bookings === null || payments === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking your session…
      </div>
    );
  }

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((booking) =>
    ACTIVE_BOOKING_STATUSES.includes(booking.status)
  ).length;
  const completedServices = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const totalSpent = payments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0
  );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your repair requests, active jobs, and payments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Total Requests"
          value={totalRequests}
          iconClassName="bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]"
        />
        <StatCard
          icon={Loader2}
          label="Active Jobs"
          value={activeJobs}
          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        />
        <StatCard
          icon={CircleCheck}
          label="Completed Services"
          value={completedServices}
          iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
        />
        <StatCard
          icon={Wallet}
          label="Total Spent"
          value={formatPrice(totalSpent)}
        />
      </div>

      {/* Recent bookings */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Requests</h2>
          <Link
            href="/dashboard/customer/bookings"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No repair requests yet"
            description="Browse approved services and send your first repair request to a verified technician."
            action={{ label: "Browse Services", href: "/services" }}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {recentBookings.map((booking) => (
              <li
                key={booking._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {booking.serviceTitle}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Technician: {booking.technicianName ?? "—"}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
