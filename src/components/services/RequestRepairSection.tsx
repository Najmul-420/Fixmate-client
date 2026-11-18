"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CircleCheck, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useSession, type FixMateUser } from "@/lib/auth-client";
import { simulateRequest } from "@/lib/placeholder";
import { todayInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import Modal from "@/components/shared/Modal";

const MIN_DESCRIPTION_LENGTH = 20;
const PHONE_PATTERN = /^[+()\d\s-]{6,20}$/;

type Props = {
  serviceId: string;
  serviceTitle: string;
};

type FormState = {
  phone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
};

const emptyForm: FormState = {
  phone: "",
  address: "",
  preferredDate: "",
  problemDescription: "",
};

/**
 * Role-aware "Request Repair" action:
 * - logged out  -> link to /sign-in (returns here afterwards)
 * - technician/admin -> disabled button with an explanatory notice
 * - customer    -> opens the request form modal
 *
 * Submitting is a placeholder until the backend booking API is connected.
 */
export default function RequestRepairSection({
  serviceId,
  serviceTitle,
}: Props) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const user = session?.user as FixMateUser | undefined;
  const role = user?.role;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.phone.trim()) {
      next.phone = "Phone number is required.";
    } else if (!PHONE_PATTERN.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number (digits, spaces, +, - or parentheses).";
    }

    if (!form.address.trim()) {
      next.address = "Your address is required.";
    } else if (form.address.trim().length < 5) {
      next.address = "Please enter a more complete address.";
    }

    if (!form.preferredDate) {
      next.preferredDate = "Please choose a preferred date.";
    } else if (form.preferredDate < todayInputValue()) {
      next.preferredDate = "Please choose today or a future date.";
    }

    if (form.problemDescription.trim().length < MIN_DESCRIPTION_LENGTH) {
      next.problemDescription = `Please describe the problem in at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "submitting" || !validate()) return;

    setStatus("submitting");
    try {
      // TODO: Connect API — POST /api/bookings with
      // { serviceId, customerPhone, address, preferredDate, problemDescription }.
      await simulateRequest(600);
      toast.success("Repair request sent to the technician.");
      setStatus("success");
    } finally {
      setStatus((current) => (current === "submitting" ? "idle" : current));
    }
  };

  const closeModal = () => {
    setOpen(false);
    if (status === "success") {
      setForm(emptyForm);
      setErrors({});
      setStatus("idle");
    }
  };

  const actionButtonClasses =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60";

  const descriptionLength = form.problemDescription.trim().length;

  return (
    <div className="flex flex-col gap-2">
      {/* Role-dependent action */}
      {isPending ? (
        <button type="button" disabled className={actionButtonClasses}>
          <Loader2 className="size-4 animate-spin" />
          Checking your session...
        </button>
      ) : !user ? (
        <Link
          href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}
          className={actionButtonClasses}
        >
          Sign In to Request Repair
        </Link>
      ) : role === "technician" || role === "admin" ? (
        <>
          <button type="button" disabled className={actionButtonClasses}>
            Request Repair
          </button>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Technicians and admins cannot send repair requests. Only customers
            can request this service.
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={actionButtonClasses}
        >
          Request Repair
        </button>
      )}

      {/* Request form modal */}
      <Modal
        open={open && Boolean(user)}
        onClose={closeModal}
        ariaLabel={`Request repair for ${serviceTitle}`}
        size="lg"
        locked={status === "submitting"}
      >
        {user && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Request Repair</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{serviceTitle}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                disabled={status === "submitting"}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CircleCheck className="size-12 text-primary" />
                <h4 className="text-base font-semibold">Request submitted!</h4>
                <p className="max-w-sm text-sm text-muted-foreground">
                  The technician has received your request. You can track its
                  status from your dashboard bookings.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-5 flex flex-col gap-4"
              >
                {/* Kept in the form so the real POST can send it later. */}
                <input type="hidden" name="serviceId" value={serviceId} />
                {/* Read-only identity fields from the session */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    type="text"
                    value={user.name ?? ""}
                    readOnly
                    className="h-10 rounded-lg border bg-muted px-3 text-sm text-muted-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Email</span>
                  <input
                    type="email"
                    value={user.email ?? ""}
                    readOnly
                    className="h-10 rounded-lg border bg-muted px-3 text-sm text-muted-foreground"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Phone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="Your contact number"
                    autoComplete="tel"
                    disabled={status === "submitting"}
                    aria-invalid={Boolean(errors.phone)}
                    className={cn(
                      "h-10 rounded-lg border bg-background px-3 text-sm focus:ring-3 focus:ring-ring/50 focus:outline-none",
                      errors.phone ? "border-destructive" : "focus:border-ring"
                    )}
                  />
                  {errors.phone && (
                    <span className="text-xs text-destructive">{errors.phone}</span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Address</span>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Where should the technician come?"
                    autoComplete="street-address"
                    disabled={status === "submitting"}
                    aria-invalid={Boolean(errors.address)}
                    className={cn(
                      "h-10 rounded-lg border bg-background px-3 text-sm focus:ring-3 focus:ring-ring/50 focus:outline-none",
                      errors.address ? "border-destructive" : "focus:border-ring"
                    )}
                  />
                  {errors.address && (
                    <span className="text-xs text-destructive">{errors.address}</span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Preferred Date</span>
                  <input
                    type="date"
                    value={form.preferredDate}
                    min={todayInputValue()}
                    onChange={(event) =>
                      updateField("preferredDate", event.target.value)
                    }
                    disabled={status === "submitting"}
                    aria-invalid={Boolean(errors.preferredDate)}
                    className={cn(
                      "h-10 rounded-lg border bg-background px-3 text-sm focus:ring-3 focus:ring-ring/50 focus:outline-none",
                      errors.preferredDate ? "border-destructive" : "focus:border-ring"
                    )}
                  />
                  {errors.preferredDate && (
                    <span className="text-xs text-destructive">
                      {errors.preferredDate}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="flex items-center justify-between text-sm font-medium">
                    Problem Description
                    <span
                      className={cn(
                        "text-xs font-normal",
                        descriptionLength >= MIN_DESCRIPTION_LENGTH
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {descriptionLength}/{MIN_DESCRIPTION_LENGTH} min.
                    </span>
                  </span>
                  <textarea
                    rows={4}
                    value={form.problemDescription}
                    onChange={(event) =>
                      updateField("problemDescription", event.target.value)
                    }
                    placeholder="Describe what is wrong with your device..."
                    disabled={status === "submitting"}
                    aria-invalid={Boolean(errors.problemDescription)}
                    className={cn(
                      "rounded-lg border bg-background px-3 py-2 text-sm focus:ring-3 focus:ring-ring/50 focus:outline-none",
                      errors.problemDescription
                        ? "border-destructive"
                        : "focus:border-ring"
                    )}
                  />
                  {errors.problemDescription && (
                    <span className="text-xs text-destructive">
                      {errors.problemDescription}
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                >
                  {status === "submitting" && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {status === "submitting" ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
