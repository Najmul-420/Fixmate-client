"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  CircleCheck,
  CircleX,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { fetchServices, updateService } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { ApprovalStatus, Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/shared/EmptyState";

const FILTERS: { value: ApprovalStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function approvalBadgeClasses(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return "bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#34D399]";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  }
}

/**
 * Admin "Service Approval": all technician services with an approval-status
 * filter and Approve / Reject moderation actions.
 */
export default function AdminServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    const list = await fetchServices();
    setServices(
      [...list].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchServices().then((list) => {
      if (cancelled) return;
      setServices(
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

  const moderate = async (service: Service, status: ApprovalStatus) => {
    setBusyId(service._id);
    const ok = await updateService(service._id, { approvalStatus: status });
    setBusyId(null);
    if (ok) {
      toast.success(`"${service.title}" ${status}.`);
      loadServices();
    } else {
      toast.error("Could not update the service. Please try again.");
    }
  };

  if (services === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading services…
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? services
      : services.filter((service) => service.approvalStatus === filter);

  const countByStatus = (status: ApprovalStatus) =>
    services.filter((service) => service.approvalStatus === status).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Approval</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review technician-submitted services. Only approved services are
          visible to customers.
        </p>
      </div>

      {/* Approval filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by approval status">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          const count =
            option.value === "all"
              ? services.length
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
          icon={ShieldCheck}
          title={
            filter === "all" ? "No services on the platform yet" : `No ${filter} services`
          }
          description={
            filter === "all"
              ? "Technician-submitted services will appear here for moderation."
              : "Try another filter to see the rest of the services."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => (
                <tr key={service._id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={64}
                        height={40}
                        className="h-10 w-16 shrink-0 rounded-lg border object-cover"
                      />
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-semibold">
                          {service.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.category} · {service.serviceMode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-44 px-4 py-3">
                    <p className="truncate">{service.technicianName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {service.technicianEmail ?? "—"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums">
                    {formatPrice(service.basePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        approvalBadgeClasses(service.approvalStatus)
                      )}
                    >
                      {service.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {service.approvalStatus !== "approved" && (
                        <button
                          type="button"
                          onClick={() => moderate(service, "approved")}
                          disabled={busyId === service._id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                        >
                          <CircleCheck className="size-3.5" />
                          Approve
                        </button>
                      )}
                      {service.approvalStatus !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => moderate(service, "rejected")}
                          disabled={busyId === service._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                        >
                          <CircleX className="size-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
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
