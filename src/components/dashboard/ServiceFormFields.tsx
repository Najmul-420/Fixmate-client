"use client";

import Image from "next/image";
import { useRef } from "react";
import { ImagePlus, Loader2, Store, House, X } from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/types";
import type { ServiceCategory, ServiceMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ServiceFormValues = {
  title: string;
  category: ServiceCategory | "";
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  image: string;
};

export type ServiceFormErrors = Partial<Record<keyof ServiceFormValues, string>>;

export const emptyServiceForm: ServiceFormValues = {
  title: "",
  category: "",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
  image: "",
};

type Props = {
  values: ServiceFormValues;
  errors: ServiceFormErrors;
  onChange: (patch: Partial<ServiceFormValues>) => void;
  /** Image upload state (URL is stored inside `values.image`). */
  uploading: boolean;
  onPickImage: (file: File) => void;
  /** Clearing the image also revokes the local preview. */
  onClearImage: () => void;
  /** Optional: disables the fields inside the edit modal while submitting. */
  disabled?: boolean;
};

const inputClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none";

/**
 * Shared fields for the Add Service page and the technician edit modal:
 * Title, Category, Description, Base Price, Estimated Duration, Service
 * Mode, Service Area, and the ImgBB image upload with preview.
 */
export default function ServiceFormFields({
  values,
  errors,
  onChange,
  uploading,
  onPickImage,
  onClearImage,
  disabled,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Image upload (ImgBB) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Service Image</span>
        {values.image ? (
          <div className="relative w-fit overflow-hidden rounded-xl border">
            <Image
              src={values.image}
              alt="Service preview"
              width={280}
              height={160}
              unoptimized
              className="h-36 w-64 object-cover"
            />
            <button
              type="button"
              onClick={onClearImage}
              aria-label="Remove image"
              disabled={disabled}
              className="absolute right-2 top-2 rounded-lg bg-[#111827]/70 p-1.5 text-white transition-colors hover:bg-[#111827]/85"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Uploading to ImgBB…
              </>
            ) : (
              <>
                <ImagePlus className="size-5" />
                Click to upload an image (ImgBB)
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onPickImage(file);
          }}
        />
        {errors.image && <span className="text-xs text-destructive">{errors.image}</span>}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Title</span>
        <input
          type="text"
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="e.g. iPhone Screen Replacement"
          disabled={disabled}
          className={cn(inputClasses, errors.title && "border-destructive")}
        />
        {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Category</span>
          <select
            value={values.category}
            onChange={(event) =>
              onChange({ category: event.target.value as ServiceCategory })
            }
            disabled={disabled}
            className={cn(inputClasses, errors.category && "border-destructive")}
          >
            <option value="" disabled>
              Select a category
            </option>
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-xs text-destructive">{errors.category}</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Base Price (USD)</span>
          <input
            type="number"
            min={1}
            step="0.5"
            value={values.basePrice}
            onChange={(event) => onChange({ basePrice: event.target.value })}
            placeholder="e.g. 45"
            disabled={disabled}
            className={cn(inputClasses, errors.basePrice && "border-destructive")}
          />
          {errors.basePrice && (
            <span className="text-xs text-destructive">{errors.basePrice}</span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Description</span>
        <textarea
          rows={3}
          value={values.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="What exactly does this service cover?"
          disabled={disabled}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Estimated Duration</span>
          <input
            type="text"
            value={values.estimatedDuration}
            onChange={(event) => onChange({ estimatedDuration: event.target.value })}
            placeholder="e.g. 1-2 hours"
            disabled={disabled}
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Service Area</span>
          <input
            type="text"
            value={values.serviceArea}
            onChange={(event) => onChange({ serviceArea: event.target.value })}
            placeholder="e.g. Dhaka, Chattogram"
            disabled={disabled}
            className={inputClasses}
          />
        </label>
      </div>

      {/* Service mode (segmented control) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Service Mode</span>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Service mode">
          {SERVICE_MODES.map((mode) => {
            const selected = values.serviceMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => onChange({ serviceMode: mode })}
                className={cn(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60",
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {mode === "Home Visit" ? (
                  <House className="size-4" />
                ) : (
                  <Store className="size-4" />
                )}
                {mode}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
