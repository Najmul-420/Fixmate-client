"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CircleCheck,
  ClipboardList,
  Loader2,
  Play,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { fetchBookings, updateBookingStatus } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";
import StatusBadge from "@/components/dashboard/StatusBadge";
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

const inputClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none";

/**
 * Technician "Manage Requests": incoming bookings with a status filter and
 * pipeline actions — Accept/Reject (requested), Start Work (accepted),
 * Mark Completed with a final-amount modal (in-progress).
 */
export default function TechnicianRequests() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Complete modal state
  const [completing, setCompleting] = useState<Booking | null>(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  const loadBookings = useCallback(async (technicianEmail: string) => {
    setBookings(null);
    const list = await fetchBookings({ technicianEmail });
    setBookings(
      [...list].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
    );
  }, []);

  useEffect(() => {
    if (!email) return;
    loadBookings(email);
  }, [email, loadBookings]);

  const setStatus = async (booking: Booking, status: BookingStatus) => {
    setBusyId(booking._id);
    const ok = await updateBookingStatus(booking._id, status);
    setBusyId(null);
    if (ok) {
      toast.success(`Request ${status === "in-progress" ? "started" : status}.`);
      if (email) loadBookings(email);
    } else {
      toast.error("Could not update the booking. Please try again.");
    }
  };

  const openComplete = (booking: Booking) => {
    setCompleting(booking);
    setFinalAmount(String(booking.basePrice ?? ""));
    setAmountError("");
  };

  const handleCompleteConfirmed = async () => {
    if (!completing) return;
    const amount = Number(finalAmount);
    if (!finalAmount || Number.isNaN(amount) || amount <= 0) {
      setAmountError("Enter a final billing amount greater than 0.");
      return;
    }
    setBusyId(completing._id);
    const ok = await updateBookingStatus(completing._id, "completed", amount);
    setBusyId(null);
    setCompleting(null);
    if (ok) {
      toast.success("Job marked as completed.");
      if (email) loadBookings(email);
    } else {
      toast.error("Could not complete the job. Please try again.");
    }
  };

  if (isPending || !email || bookings === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading incoming requests…
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
        <h1 className="text-2xl font-bold tracking-tight">Manage Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept repair requests, work through the job pipeline, and bill on
          completion.
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
          title={
            filter === "all" ? "No repair requests yet" : `No ${filter} requests`
          }
          description={
            filter === "all"
              ? "When customers request your services, they will appear here."
              : "Try another status filter, or clear the filter to see all requests."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Preferred Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id} className="border-b align-top last:border-0">
                    <td className="max-w-64 px-4 py-3">
                      <p className="truncate font-semibold">{booking.serviceTitle}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {booking.problemDescription ?? "No description provided"}
                      </p>
                    </td>
                    <td className="max-w-48 px-4 py-3">
                      <p className="truncate">{booking.customerName ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.customerPhone ?? booking.customerEmail}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {booking.address ?? "No address"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                      {booking.status === "completed" && booking.finalAmount != null && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Billed {formatPrice(booking.finalAmount)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {booking.status === "requested" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setStatus(booking, "accepted")}
                              disabled={busyId === booking._id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(booking, "rejected")}
                              disabled={busyId === booking._id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === "accepted" && (
                          <button
                            type="button"
                            onClick={() => setStatus(booking, "in-progress")}
                            disabled={busyId === booking._id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]/90 disabled:pointer-events-none disabled:opacity-60"
                          >
                            <Play className="size-3.5" />
                            Start Work
                          </button>
                        )}
                        {booking.status === "in-progress" && (
                          <button
                            type="button"
                            onClick={() => openComplete(booking)}
                            disabled={busyId === booking._id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                          >
                            <CircleCheck className="size-3.5" />
                            Mark Completed
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
          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((booking) => (
              <li key={booking._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{booking.serviceTitle}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.problemDescription ?? "No description provided"}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="truncate">{booking.customerName ?? "—"}</dd>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="truncate">{booking.customerPhone ?? "—"}</dd>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="truncate">{booking.address ?? "—"}</dd>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{formatDate(booking.preferredDate)}</dd>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {booking.status === "requested" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(booking, "accepted")}
                        disabled={busyId === booking._id}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(booking, "rejected")}
                        disabled={busyId === booking._id}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-destructive/30 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => setStatus(booking, "in-progress")}
                      disabled={busyId === booking._id}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]/90 disabled:opacity-60"
                    >
                      <Play className="size-3.5" />
                      Start Work
                    </button>
                  )}
                  {booking.status === "in-progress" && (
                    <button
                      type="button"
                      onClick={() => openComplete(booking)}
                      disabled={busyId === booking._id}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                    >
                      <CircleCheck className="size-3.5" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Final amount modal (Mark Completed) */}
      {completing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setCompleting(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mark job completed"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Complete the job</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {completing.serviceTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompleting(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <label className="mt-5 flex flex-col gap-1.5">
              <span className="text-sm font-medium">Final Billing Amount (USD)</span>
              <input
                type="number"
                min={1}
                step="0.5"
                value={finalAmount}
                onChange={(event) => {
                  setFinalAmount(event.target.value);
                  setAmountError("");
                }}
                placeholder="e.g. 60"
                autoFocus
                className={`${inputClasses} ${amountError ? "border-destructive" : ""}`}
              />
              {amountError ? (
                <span className="text-xs text-destructive">{amountError}</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  The customer will pay this amount via Stripe. Base price:{" "}
                  {formatPrice(completing.basePrice ?? 0)}
                </span>
              )}
            </label>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCompleting(null)}
                className="h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteConfirmed}
                disabled={busyId === completing._id}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {busyId === completing._id && <Loader2 className="size-4 animate-spin" />}
                {busyId === completing._id ? "Completing…" : "Complete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
