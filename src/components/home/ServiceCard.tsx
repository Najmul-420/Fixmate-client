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
import type { Service } from "@/lib/types";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[3/2] w-full bg-muted">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {service.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB]/10 px-2.5 py-0.5 text-xs font-medium text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA]">
            {service.serviceMode === "Home Visit" ? (
              <House className="size-3" />
            ) : (
              <Store className="size-3" />
            )}
            {service.serviceMode}
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-balance">
          {service.title}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {service.technicianName}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {service.serviceArea || "Dhaka"}
            {service.estimatedDuration && (
              <>
                <Timer className="ml-1 size-3.5" />
                {service.estimatedDuration}
              </>
            )}
          </span>
        </div>

        {/* Footer pinned to the bottom for uniform card height */}
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <p className="text-sm text-muted-foreground">
            Starting at{" "}
            <span className="text-base font-bold text-foreground">
              {formatPrice(service.basePrice)}
            </span>
          </p>
          <Link
            href={`/services/${service._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
          >
            View Details
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
