"use client";

import { useEffect, useState } from "react";
import {
  CircleCheck,
  Coins,
  FolderOpen,
  Loader2,
  Users,
  Wrench,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { fetchBookings, fetchPayments, fetchServices, fetchUsers } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import {
  ACTIVE_BOOKING_STATUSES,
  type AdminUser,
  type Booking,
  type Payment,
  type Service,
} from "@/lib/types";

/**
 * Admin dashboard overview: total users, total services, active jobs and
 * total platform revenue — computed live from the API (no demo data).
 */
export default function AdminOverview() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchUsers(), fetchServices(), fetchBookings(), fetchPayments()])
      .then(([userList, serviceList, bookingList, paymentList]) => {
        if (cancelled) return;
        setUsers(userList);
        setServices(serviceList);
        setBookings(bookingList);
        setPayments(paymentList);
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([]);
          setServices([]);
          setBookings([]);
          setPayments([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (users === null || services === null || bookings === null || payments === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading platform overview…
      </div>
    );
  }

  const activeJobs = bookings.filter((booking) =>
    ACTIVE_BOOKING_STATUSES.includes(booking.status)
  ).length;
  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const totalRevenue = payments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0
  );
  const customers = users.filter((user) => user.role === "customer").length;
  const technicians = users.filter((user) => user.role === "technician").length;

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide statistics, users, services, and transactions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={users.length}
          iconClassName="bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6]"
        />
        <StatCard icon={FolderOpen} label="Total Services" value={services.length} />
        <StatCard
          icon={Wrench}
          label="Active Jobs"
          value={activeJobs}
          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        />
        <StatCard
          icon={Coins}
          label="Total Revenue"
          value={formatPrice(totalRevenue)}
        />
      </div>

      {/* Breakdown strip */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4 text-primary" />
          {customers} customers · {technicians} technicians
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CircleCheck className="size-4 text-primary" />
          {completedJobs} completed jobs all-time
        </span>
      </div>

      {/* Recent bookings */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <EmptyState
            title="No bookings on the platform yet"
            description="Once customers start requesting repair services, the latest activity will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {recentBookings.map((booking) => (
              <li
                key={booking._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{booking.serviceTitle}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {booking.customerName ?? booking.customerEmail} →{" "}
                    {booking.technicianName ?? "—"}
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
