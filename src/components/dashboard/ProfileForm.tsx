"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { authClient, type FixMateUser } from "@/lib/auth-client";
import { readImagePreview, validateImageFile } from "@/lib/local-image";
import { roleBadgeStyles, roleLabel } from "@/lib/badges";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

type FormValues = {
  name: string;
  phone: string;
  area: string;
  bio: string;
  image: string;
};

type Props = {
  user: FixMateUser;
  /** Called after a successful save so the parent can refresh the session. */
  onSaved: () => void;
};

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Shared profile editor for customers, technicians and admins.
 * Only "self" fields are editable here — the role is managed by an admin.
 * The component is mounted with `key={user.id}` so the initial values come
 * from props exactly once (no state syncing effects needed).
 */
export default function ProfileForm({ user, onSaved }: Props) {
  const [form, setForm] = useState<FormValues>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    area: user.area ?? "",
    bio: user.bio ?? "",
    image: user.image ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (patch: Partial<FormValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  const handlePickImage = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      // TODO: Connect API — upload the file to ImgBB and store the hosted URL.
      // Until then the selected image is only a local preview (data URL).
      const preview = await readImagePreview(file);
      handleChange({ image: preview });
      toast.success("Photo selected — preview updated locally.");
    } catch {
      toast.error("Could not read that image. Please try another file.");
    } finally {
      setUploading(false);
    }
  };

  const isLocalPreview = form.image.startsWith("data:");

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (form.phone.trim() && !/^[+()\d\s-]{6,20}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    if (form.bio.length > 500) {
      next.bio = "Bio must be 500 characters or fewer.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    try {
      // `phone`, `area` and `bio` are declared under `user.additionalFields`
      // in src/lib/auth.ts, so BetterAuth persists them here.
      const { error } = await authClient.updateUser({
        name: form.name.trim(),
        // TODO: Connect API — upload a locally selected preview to ImgBB, then
        // send the hosted URL here. A data URL is preview-only and is skipped.
        ...(isLocalPreview ? {} : { image: form.image || null }),
        phone: form.phone.trim(),
        area: form.area.trim(),
        bio: form.bio.trim(),
      });
      if (error) {
        toast.error(
          error.message ?? "Could not save your profile. Please try again."
        );
        return;
      }
      toast.success(
        isLocalPreview
          ? "Profile details saved. The new photo will be uploaded once the API is connected."
          : "Profile updated."
      );
      onSaved();
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Avatar + identity */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center">
          <div className="relative">
            {form.image ? (
              <Image
                src={form.image}
                alt="Profile photo"
                width={112}
                height={112}
                unoptimized
                className="size-24 rounded-full border object-cover"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {getInitials(form.name)}
              </span>
            )}
            {form.image && (
              <button
                type="button"
                onClick={() => handleChange({ image: "" })}
                aria-label="Remove profile photo"
                disabled={saving}
                className="absolute -right-1 -top-1 rounded-full bg-[#111827]/85 p-1.5 text-white transition-colors hover:bg-[#111827] disabled:opacity-60"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Reading…
              </>
            ) : (
              <>
                <ImagePlus className="size-3.5" />
                Change photo
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handlePickImage(file);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {isLocalPreview
              ? "Local preview only — this photo uploads to ImgBB once the API is connected."
              : "JPG or PNG, up to 5 MB. Hosted on ImgBB."}
          </p>

          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              roleBadgeStyles[user.role ?? "customer"]
            )}
          >
            {roleLabel(user.role)}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Full Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange({ name: event.target.value })}
              placeholder="Your full name"
              autoComplete="name"
              disabled={saving}
              aria-invalid={Boolean(errors.name)}
              className={cn(inputClasses, errors.name && "border-destructive")}
            />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name}</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={user.email}
              readOnly
              disabled
              className={inputClasses}
            />
            <span className="text-xs text-muted-foreground">
              Your email is used for sign-in and cannot be changed here.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => handleChange({ phone: event.target.value })}
                placeholder="e.g. +880 1700 000000"
                autoComplete="tel"
                disabled={saving}
                aria-invalid={Boolean(errors.phone)}
                className={cn(inputClasses, errors.phone && "border-destructive")}
              />
              {errors.phone && (
                <span className="text-xs text-destructive">{errors.phone}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Area</span>
              <input
                type="text"
                value={form.area}
                onChange={(event) => handleChange({ area: event.target.value })}
                placeholder="e.g. Dhaka, Mirpur"
                disabled={saving}
                className={inputClasses}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-sm font-medium">
              Bio
              <span className="text-xs font-normal text-muted-foreground">
                {form.bio.length}/500
              </span>
            </span>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(event) => handleChange({ bio: event.target.value })}
              placeholder="Tell customers or technicians a little about yourself."
              disabled={saving}
              maxLength={500}
              aria-invalid={Boolean(errors.bio)}
              className={cn(
                "rounded-lg border bg-background px-3 py-2 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none",
                errors.bio && "border-destructive"
              )}
            />
            {errors.bio && (
              <span className="text-xs text-destructive">{errors.bio}</span>
            )}
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
