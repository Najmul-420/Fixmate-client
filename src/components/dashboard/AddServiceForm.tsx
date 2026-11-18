"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { readImagePreview, validateImageFile } from "@/lib/local-image";
import { simulateRequest } from "@/lib/placeholder";
import ServiceFormFields, {
  emptyServiceForm,
  type ServiceFormErrors,
  type ServiceFormValues,
} from "@/components/dashboard/ServiceFormFields";

/**
 * Technician "Add Service": full form with a local image preview. Saving is a
 * placeholder until the backend/ImgBB are connected.
 */
export default function AddServiceForm() {
  const router = useRouter();

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
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      setErrors((prev) => ({ ...prev, image: validationError }));
      return;
    }

    setUploading(true);
    try {
      // TODO: Connect API — upload the file to ImgBB and store the hosted URL.
      const preview = await readImagePreview(file);
      handleChange({ image: preview });
      toast.success("Image selected — preview shown locally.");
    } catch {
      toast.error("Could not read that image. Please try another file.");
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => handleChange({ image: "" });

  const validate = () => {
    const next: ServiceFormErrors = {};
    const title = form.title.trim();
    if (!title) {
      next.title = "Title is required.";
    } else if (title.length < 5) {
      next.title = "Title must be at least 5 characters.";
    }

    if (!form.category) next.category = "Please choose a category.";

    const price = Number(form.basePrice);
    if (!form.basePrice || !Number.isFinite(price) || price <= 0) {
      next.basePrice = "Enter a base price greater than 0.";
    } else if (price > 100_000) {
      next.basePrice = "Base price must be $100,000 or less.";
    }

    if (form.description.trim().length > 500) {
      next.description = "Description must be 500 characters or fewer.";
    }
    if (!form.image) next.image = "Please select a service image.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      // TODO: Connect API — POST /api/services with the form payload (including
      // the technician identity and the ImgBB-hosted image URL).
      await simulateRequest();
      toast.success("Service added! It will be pending admin approval.");
      setSuccess(true);
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
