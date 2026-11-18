"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CircleAlert,
  CreditCard,
  Loader2,
  ReceiptText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { cancelBooking, createCheckoutSession, fetchBookings } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PaymentBadge from "@/components/dashboard/PaymentBadge";
import EmptyState from "@/components/shared/EmptyState";

/**
 * Customer "My Bookings": every booking the signed-in customer made, with
 * status + payment badges, a Cancel action for still-pending requests, and
 * a Pay Now (Stripe Checkout) action for completed-unpaid jobs.
 */
export default function CustomerBookings() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const loadBookings = useCallback(
    async (customerEmail: string) => {
      const list = await fetchBookings({ customerEmail });
      setBookings(
        [...list].sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
      );
    },
    []
  );

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

  const handleCancelConfirmed = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget._id);
    const ok = await cancelBooking(cancelTarget._id);
    setBusyId(null);
    setCancelTarget(null);
    if (ok) {
      toast.success("Booking cancelled.");
      if (email) loadBookings(email);
    } else {
      toast.error("Could not cancel the booking. Please try again.");
    }
  };

  const handlePayNow = async (booking: Booking) => {
    setBusyId(booking._id);
    const url = await createCheckoutSession(booking._id);
    setBusyId(null);
    if (url) {
      window.location.assign(url);
    } else {
      toast.error(
        "Could not start checkout right now. Please try again in a moment."
      );
    }
  };

  if (isPending || !email || bookings === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your bookings…
      </div>
    );
  }

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
                {bookings.map((booking) => (
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
            {bookings.map((booking) => (
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

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-sm"
          onClick={() => setCancelTarget(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm cancellation"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl"
          >
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
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-destructive text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                {busyId === cancelTarget._id && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {busyId === cancelTarget._id ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
