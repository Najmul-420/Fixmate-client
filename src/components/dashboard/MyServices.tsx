"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { deleteService, fetchServices, updateService } from "@/lib/api";
import { uploadToImgbb } from "@/lib/imgbb";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/shared/EmptyState";
import ServiceFormFields, {
  emptyServiceForm,
  type ServiceFormErrors,
  type ServiceFormValues,
} from "@/components/dashboard/ServiceFormFields";

function approvalBadgeClasses(status: Service["approvalStatus"]) {
  switch (status) {
    case "approved":
      return "bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#34D399]";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  }
}

/** Availability toggle switch (aria-compliant, no deps). */
function AvailabilityToggle({
  available,
  busy,
  onToggle,
}: {
  available: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      disabled={busy}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
        available ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 translate-x-1 rounded-full bg-white shadow transition-transform",
          available && "translate-x-6"
        )}
      />
    </button>
  );
}

/**
 * Technician "My Services": full CRUD — edit modal, delete confirmation,
 * and availability toggle — driven entirely by live API data.
 */
export default function MyServices() {
  const { data: session, isPending } = useSession();
  const email = session?.user?.email ?? null;

  const [services, setServices] = useState<Service[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Edit modal state
  const [editing, setEditing] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState<ServiceFormValues>(emptyServiceForm);
  const [editErrors, setEditErrors] = useState<ServiceFormErrors>({});
  const [editUploading, setEditUploading] = useState(false);

  // Delete confirmation state
  const [deleting, setDeleting] = useState<Service | null>(null);

  const loadServices = useCallback(async (technicianEmail: string) => {
    setServices(null);
    const list = await fetchServices({ technicianEmail });
    setServices(
      [...list].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
    );
  }, []);

  useEffect(() => {
    if (!email) return;
    loadServices(email);
  }, [email, loadServices]);

  const openEdit = (service: Service) => {
    setEditing(service);
    setEditErrors({});
    setEditForm({
      title: service.title,
      category: service.category,
      description: service.description ?? "",
      basePrice: String(service.basePrice ?? ""),
      estimatedDuration: service.estimatedDuration ?? "",
      serviceMode: service.serviceMode,
      serviceArea: service.serviceArea ?? "",
      image: service.image,
    });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const next: ServiceFormErrors = {};
    if (!editForm.title.trim()) next.title = "Title is required.";
    if (!editForm.category) next.category = "Please choose a category.";
    const price = Number(editForm.basePrice);
    if (!editForm.basePrice || Number.isNaN(price) || price <= 0) {
      next.basePrice = "Enter a base price greater than 0.";
    }
    if (!editForm.image) next.image = "Please upload a service image.";
    setEditErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusyId(editing._id);
    const ok = await updateService(editing._id, {
      title: editForm.title.trim(),
      category: editForm.category as Service["category"],
      description: editForm.description.trim() || undefined,
      image: editForm.image,
      basePrice: price,
      estimatedDuration: editForm.estimatedDuration.trim() || undefined,
      serviceMode: editForm.serviceMode,
      serviceArea: editForm.serviceArea.trim() || undefined,
    });
    setBusyId(null);
    if (ok) {
      toast.success("Service updated.");
      setEditing(null);
      if (email) loadServices(email);
    } else {
      toast.error("Could not update the service. Please try again.");
    }
  };

  const handleEditImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setEditUploading(true);
    const url = await uploadToImgbb(file);
    setEditUploading(false);
    if (!url) {
      toast.error("Image upload failed. Please try a different file.");
      return;
    }
    setEditForm((prev) => ({ ...prev, image: url }));
  };

  const handleToggleAvailability = async (service: Service) => {
    setBusyId(service._id);
    const ok = await updateService(service._id, {
      isAvailable: service.isAvailable === false,
    });
    setBusyId(null);
    if (ok) {
      toast.success(service.isAvailable === false ? "Service is now available." : "Service hidden from customers.");
      if (email) loadServices(email);
    } else {
      toast.error("Could not change availability. Please try again.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleting) return;
    setBusyId(deleting._id);
    const ok = await deleteService(deleting._id);
    setBusyId(null);
    setDeleting(null);
    if (ok) {
      toast.success("Service deleted.");
      if (email) loadServices(email);
    } else {
      toast.error("Could not delete the service. Please try again.");
    }
  };

  if (isPending || !email || services === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading your services…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your service inventory: edit, delete, or toggle availability.
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No services yet"
          description="Add your first repair service so customers can find and request you."
          action={{ label: "Add a Service", href: "/dashboard/technician/add-service" }}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
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
                    <div className="flex items-center gap-2">
                      <AvailabilityToggle
                        available={service.isAvailable !== false}
                        busy={busyId === service._id}
                        onToggle={() => handleToggleAvailability(service)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {service.isAvailable !== false ? "Live" : "Hidden"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(service)}
                        disabled={busyId === service._id}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(service)}
                        disabled={busyId === service._id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Edit ${editing.title}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">Edit Service</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5">
              <ServiceFormFields
                values={editForm}
                errors={editErrors}
                onChange={(patch) => {
                  setEditForm((prev) => ({ ...prev, ...patch }));
                  setEditErrors((prev) => ({
                    ...prev,
                    ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])),
                  }));
                }}
                uploading={editUploading}
                onPickImage={handleEditImage}
                onClearImage={() => setEditForm((prev) => ({ ...prev, image: "" }))}
                disabled={busyId === editing._id}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors hover:bg-muted sm:flex-none sm:px-6"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editUploading || busyId === editing._id}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60 sm:flex-none sm:px-6"
              >
                {busyId === editing._id && <Loader2 className="size-4 animate-spin" />}
                {busyId === editing._id ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setDeleting(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm deletion"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </span>
              <button
                type="button"
                onClick={() => setDeleting(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <h3 className="mt-3 text-lg font-semibold">Delete this service?</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{deleting.title}</span>{" "}
              will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="h-10 flex-1 rounded-lg border text-sm font-semibold transition-colors hover:bg-muted"
              >
                Keep Service
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={busyId === deleting._id}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-destructive text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {busyId === deleting._id && <Loader2 className="size-4 animate-spin" />}
                {busyId === deleting._id ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
