"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CircleCheck,
  ClipboardList,
  FolderOpen,
  Inbox,
  Loader2,
  Wrench,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { fetchBookings, fetchServices } from "@/lib/api";
import type { Booking, Service } from "@/lib/types";

/**
 * Technician dashboard overview: my services, incoming requests, active
 * jobs and completed jobs — computed live from the API (no demo data).
 */
export default function TechnicianOverview() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [services, setServices] = useState<Service[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    Promise.all([
      fetchServices({ technicianEmail: email }),
      fetchBookings({ technicianEmail: email }),
    ])
      .then(([serviceList, bookingList]) => {
        if (!cancelled) {
          setServices(serviceList);
          setBookings(bookingList);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServices([]);
          setBookings([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (isPending || !email || services === null || bookings === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking your session…
      </div>
    );
  }

  const incomingRequests = bookings.filter(
    (booking) => booking.status === "requested"
  ).length;
  const activeJobs = bookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "in-progress"
  ).length;
  const completedJobs = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const recentRequests = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Technician Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your services, incoming repair requests, and active jobs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderOpen}
          label="My Services"
          value={services.length}
        />
        <StatCard
          icon={Inbox}
          label="Incoming Requests"
          value={incomingRequests}
          iconClassName="bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6]"
        />
        <StatCard
          icon={Wrench}
          label="Active Jobs"
          value={activeJobs}
          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        />
        <StatCard
          icon={CircleCheck}
          label="Completed Jobs"
          value={completedJobs}
          iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400"
        />
      </div>

      {/* Recent requests */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Requests</h2>
          <Link
            href="/dashboard/technician/requests"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Manage all
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No repair requests yet"
            description={
              services.length === 0
                ? "Add your first repair service so customers can find and request you."
                : "When customers request your services, they will appear here."
            }
            action={
              services.length === 0
                ? { label: "Add a Service", href: "/dashboard/technician/add-service" }
                : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {recentRequests.map((booking) => (
              <li
                key={booking._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{booking.serviceTitle}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Customer: {booking.customerName ?? booking.customerEmail}
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
