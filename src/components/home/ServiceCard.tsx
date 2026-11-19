"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  House,
  MapPin,
  Store,
  Timer,
  User,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/types";

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=80";

function getSafeImageUrl(url?: string | null): string {
  if (!url) return FALLBACK_SERVICE_IMAGE;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed.includes("example.com") ||
    trimmed.includes("/example/")
  ) {
    return FALLBACK_SERVICE_IMAGE;
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }
  return FALLBACK_SERVICE_IMAGE;
}

export default function ServiceCard({ service }: { service: Service }) {
  const [imgSrc, setImgSrc] = useState<string>(() =>
    getSafeImageUrl(service.image)
  );

  useEffect(() => {
    setImgSrc(getSafeImageUrl(service.image));
  }, [service.image]);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={imgSrc}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          onError={() => {
            if (imgSrc !== FALLBACK_SERVICE_IMAGE) {
              setImgSrc(FALLBACK_SERVICE_IMAGE);
            }
          }}
        />
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {service.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB]/10 px-2.5 py-0.5 text-xs font-medium text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#3B82F6]">
            {service.serviceMode === "Home Visit" ? (
              <House className="size-3 shrink-0" />
            ) : (
              <Store className="size-3 shrink-0" />
            )}
            <span>{service.serviceMode}</span>
          </span>
        </div>

        <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-balance sm:text-lg">
          {service.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground sm:text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{service.technicianName}</span>
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{service.serviceArea || "Dhaka"}</span>
            </span>
            {service.estimatedDuration && (
              <span className="inline-flex items-center gap-1">
                <Timer className="ml-0.5 size-3.5 shrink-0 sm:ml-1" />
                <span>{service.estimatedDuration}</span>
              </span>
            )}
          </span>
        </div>

        {/* Footer pinned to the bottom for uniform card height */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Starting at{" "}
            <span className="text-sm font-bold text-foreground sm:text-base">
              {formatPrice(service.basePrice)}
            </span>
          </p>
          <Link
            href={`/services/${service._id}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <span>View Details</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}