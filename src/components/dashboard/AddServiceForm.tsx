"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { createService } from "@/lib/api";
import { uploadToImgbb } from "@/lib/imgbb";
import type { Service } from "@/lib/types";
import ServiceFormFields, {
  emptyServiceForm,
  type ServiceFormErrors,
  type ServiceFormValues,
} from "@/components/dashboard/ServiceFormFields";

/**
 * Technician "Add Service": full form with an ImgBB image upload.
 * New services start as `pending` until an admin approves them.
 */
export default function AddServiceForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [form, setForm] = useState<ServiceFormValues>(emptyServiceForm);
  const [errors, setErrors] = useState<ServiceFormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (patch: Partial<ServiceFormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => ({ ...prev, ...patchKeys(patch) }));
  };

  const handlePickImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    const url = await uploadToImgbb(file);
    setUploading(false);
    if (!url) {
      toast.error("Image upload failed. Please try a different file.");
      return;
    }
    handleChange({ image: url });
  };

  const handleClearImage = () => handleChange({ image: "" });

  const validate = () => {
    const next: ServiceFormErrors = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.category) next.category = "Please choose a category.";
    const price = Number(form.basePrice);
    if (!form.basePrice || Number.isNaN(price) || price <= 0) {
      next.basePrice = "Enter a base price greater than 0.";
    }
    if (!form.image) next.image = "Please upload a service image.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const created = await createService({
        title: form.title.trim(),
        category: form.category as Service["category"],
        description: form.description.trim() || undefined,
        image: form.image,
        basePrice: Number(form.basePrice),
        estimatedDuration: form.estimatedDuration.trim() || undefined,
        serviceMode: form.serviceMode,
        serviceArea: form.serviceArea.trim() || undefined,
        technicianName: user?.name ?? "Unknown Technician",
        technicianEmail: user?.email ?? undefined,
        isAvailable: true,
      });
      if (!created) {
        toast.error("Could not save the service. Please try again.");
        return;
      }
      toast.success("Service added! It is pending admin approval.");
      setSuccess(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndContinue = () => {
    setForm(emptyServiceForm);
    setErrors({});
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <CircleCheck className="size-7 text-primary" />
        </span>
        <h2 className="text-lg font-semibold">Service submitted!</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          It is now <span className="font-semibold">pending admin approval</span>.
          Customers will see it once approved. You can track its status under My
          Services.
        </p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={resetAndContinue}
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Add Another Service
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/technician/my-services")}
            className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Go to My Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Offer a new repair service. It will be reviewed by an admin before
          going live.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ServiceFormFields
          values={form}
          errors={errors}
          onChange={handleChange}
          uploading={uploading}
          onPickImage={handlePickImage}
          onClearImage={handleClearImage}
          disabled={submitting}
        />
      </div>

      <button
        type="submit"
        disabled={uploading || submitting}
        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? "Saving..." : "Add Service"}
      </button>
    </form>
  );
}

/** Keep errors in sync when a field is edited (clear its error). */
function patchKeys(patch: Partial<ServiceFormValues>): Partial<ServiceFormErrors> {
  const cleared: Partial<ServiceFormErrors> = {};
  for (const key of Object.keys(patch) as (keyof ServiceFormValues)[]) {
    cleared[key] = undefined;
  }
  return cleared;
}
