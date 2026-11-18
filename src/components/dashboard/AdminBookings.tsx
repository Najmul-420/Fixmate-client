"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import { fetchBookings } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentBadge from "@/components/dashboard/PaymentBadge";
import EmptyState from "@/components/shared/EmptyState";

const FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * Admin "All Bookings": read-only monitoring of every booking on the
 * platform, with a status filter. No mutations — moderation happens on the
 * customer/technician dashboards.
 */
export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;
    fetchBookings().then((list) => {
      if (cancelled) return;
      setBookings(
        [...list].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (bookings === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading bookings…
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  const countByStatus = (status: BookingStatus) =>
    bookings.filter((booking) => booking.status === status).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only monitoring of every repair job on the platform.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length === 1 ? "" : "s"} total
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          const count =
            option.value === "all"
              ? bookings.length
              : countByStatus(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(option.value)}
              className={
                active
                  ? "inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              {option.label}
              <span
                className={
                  active
                    ? "rounded-full bg-white/20 px-1.5 text-[10px]"
                    : "rounded-full bg-muted px-1.5 text-[10px]"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
          description={
            filter === "all"
              ? "Bookings created by customers will appear here."
              : "Try another status filter to see the rest of the bookings."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking._id} className="border-b last:border-0">
                  <td className="max-w-56 truncate px-4 py-3 font-semibold">
                    {booking.serviceTitle}
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                    {booking.customerName ?? booking.customerEmail}
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                    {booking.technicianName ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(booking.preferredDate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">
                    {formatPrice(booking.finalAmount ?? booking.basePrice ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
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
