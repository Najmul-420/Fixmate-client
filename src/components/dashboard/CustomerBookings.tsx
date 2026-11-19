"use client";

import { useEffect, useState } from "react";
import {
  CircleAlert,
  CreditCard,
  Loader2,
  ReceiptText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, type FixMateUser } from "@/lib/auth-client";
import { cancelBooking, createCheckoutSession, fetchBookings } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentBadge from "@/components/dashboard/PaymentBadge";
import EmptyState from "@/components/shared/EmptyState";
import Modal from "@/components/shared/Modal";

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
 * Customer "My Bookings": every booking the signed-in customer made, with
 * status + payment badges, a status filter, a Cancel action for still-pending
 * requests, and a Pay Now (Stripe Checkout) action for completed-unpaid jobs.
 */
export default function CustomerBookings() {
  const { data: session, isPending } = useSession();
  const user = session?.user as FixMateUser | undefined;
  const email = user?.email ?? null;

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    fetchBookings({ customerEmail: email }).then((list) => {
      if (cancelled) return;
      setBookings(
        [...list].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const patchBooking = (id: string, patch: Partial<Booking>) => {
    setBookings((prev) =>
      prev ? prev.map((item) => (item._id === id ? { ...item, ...patch } : item)) : prev
    );
  };

  const handleCancelConfirmed = async () => {
    if (!cancelTarget || !user) return;
    setBusyId(cancelTarget._id);
    try {
      const ok = await cancelBooking(cancelTarget._id, {
        email: user.email,
        role: user.role ?? "customer",
      });
      if (ok) {
        patchBooking(cancelTarget._id, { status: "cancelled" });
        toast.success("Booking cancelled.");
        setCancelTarget(null);
      } else {
        toast.error("Failed to cancel booking. Please try again.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handlePayNow = async (booking: Booking) => {
    setBusyId(booking._id);
    try {
      const url = await createCheckoutSession(booking._id);
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Payment system not available right now. Please try again later.");
      }
    } finally {
      setBusyId(null);
    }
  };

  if (isPending || !email || bookings === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your bookings&hellip;
      </div>
    );
  }

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const countByStatus = (status: BookingStatus) =>
    bookings.filter((b) => b.status === status).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of your repair requests and pay after completion.
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No bookings yet"
          description="Browse approved services and send your first repair request to a verified technician."
          action={{ label: "Browse Services", href: "/services" }}
        />
      ) : (
        <>
          {/* Status filter tabs */}
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter bookings by status"
          >
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
                      ? "inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors"
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
              icon={ReceiptText}
              title={`No ${filter} bookings`}
              description="You have no bookings with this status right now."
              action={{ label: "Show all bookings", onClick: () => setFilter("all") }}
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
                      <th className="px-4 py-3">Preferred Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking) => (
                      <tr key={booking._id} className="border-b last:border-0">
                        <td className="max-w-56 truncate px-4 py-3 font-semibold">
                          {booking.serviceTitle}
                        </td>
                        <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                          {booking.technicianName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(booking.preferredDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">
                          {formatPrice(booking.finalAmount ?? booking.basePrice ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={booking.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {booking.status === "requested" && (
                              <button
                                type="button"
                                onClick={() => setCancelTarget(booking)}
                                disabled={busyId === booking._id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            )}
                            {booking.status === "completed" &&
                              booking.paymentStatus !== "paid" && (
                                <button
                                  type="button"
                                  onClick={() => handlePayNow(booking)}
                                  disabled={busyId === booking._id}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                                >
                                  {busyId === booking._id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <CreditCard className="size-3.5" />
                                  )}
                                  Pay Now
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="flex flex-col gap-3 md:hidden">
                {filtered.map((booking) => (
                  <li key={booking._id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{booking.serviceTitle}</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Technician</dt>
                      <dd className="truncate">{booking.technicianName ?? "—"}</dd>
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{formatDate(booking.preferredDate)}</dd>
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatPrice(booking.finalAmount ?? booking.basePrice ?? 0)}
                      </dd>
                      <dt className="text-muted-foreground">Payment</dt>
                      <dd>
                        <PaymentBadge status={booking.paymentStatus} />
                      </dd>
                    </dl>
                    <div className="mt-4 flex gap-2">
                      {booking.status === "requested" && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(booking)}
                          disabled={busyId === booking._id}
                          className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-destructive/30 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === "completed" &&
                        booking.paymentStatus !== "paid" && (
                          <button
                            type="button"
                            onClick={() => handlePayNow(booking)}
                            disabled={busyId === booking._id}
                            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                          >
                            {busyId === booking._id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="size-3.5" />
                            )}
                            Pay Now
                          </button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        ariaLabel="Confirm cancellation"
        size="sm"
        locked={Boolean(cancelTarget && busyId === cancelTarget._id)}
      >
        {cancelTarget && (
          <>
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <CircleAlert className="size-5" />
              </span>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <h3 className="mt-3 text-lg font-semibold">Cancel this booking?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You are about to cancel{" "}
              <span className="font-semibold text-foreground">
                {cancelTarget.serviceTitle}
              </span>
              . This can only be done while the request is still pending and
              cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors hover:bg-muted"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelConfirmed}
                disabled={busyId === cancelTarget._id}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-destructive text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {busyId === cancelTarget._id && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {busyId === cancelTarget._id ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
