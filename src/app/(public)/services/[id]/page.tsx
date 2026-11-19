import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  House,
  Mail,
  MapPin,
  Store,
} from "lucide-react";
import { getServiceById } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import RequestRepairSection from "@/components/services/RequestRepairSection";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Service Details | FixMate",
};

const FALLBACK_SERVICE_IMAGE =
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80";

function getSafeImageUrl(url?: string | null): string {
  if (!url) return FALLBACK_SERVICE_IMAGE;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes("example.com") || trimmed.includes("/example/")) {
    return FALLBACK_SERVICE_IMAGE;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return FALLBACK_SERVICE_IMAGE;
}

function getInitials(name?: string | null) {
  if (!name) return "FM";
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Streamed in while the service data is being fetched. */
function DetailsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <div className="aspect-[16/10] w-full animate-pulse rounded-2xl border bg-muted sm:aspect-[16/9]" />
        <div className="h-8 w-4/5 animate-pulse rounded-lg bg-muted sm:h-10 sm:w-3/4" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="h-24 animate-pulse rounded-xl border bg-muted" />
          <div className="h-24 animate-pulse rounded-xl border bg-muted" />
          <div className="h-24 animate-pulse rounded-xl border bg-muted" />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <div className="h-44 w-full animate-pulse rounded-2xl border bg-muted" />
        <div className="h-44 w-full animate-pulse rounded-2xl border bg-muted" />
      </div>
    </div>
  );
}

export default function ServiceDetailsPage({ params }: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 shrink-0" />
        <span>Back to Services</span>
      </Link>

      <Suspense fallback={<DetailsSkeleton />}>
        <ServiceDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ServiceDetails({ params }: Props) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  const serviceImageSrc = getSafeImageUrl(service.image);
  const technicianImageSrc = service.technicianImage
    ? getSafeImageUrl(service.technicianImage)
    : null;

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Main column: Phone / Tablet / Laptop / Desktop */}
      <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted sm:aspect-[16/9]">
          <Image
            src={serviceImageSrc}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 65vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3.5 sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {service.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-medium text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#3B82F6]">
              {service.serviceMode === "Home Visit" ? (
                <House className="size-3 shrink-0" />
              ) : (
                <Store className="size-3 shrink-0" />
              )}
              <span>{service.serviceMode}</span>
            </span>
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl">
            {service.title}
          </h1>

          {service.description && (
            <p className="break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
              {service.description}
            </p>
          )}

          {/* Specs grid: 1 col on phone, 3 cols on tablet/desktop */}
          <dl className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="min-w-0 rounded-xl border bg-card p-3.5 sm:p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Starting Price
              </dt>
              <dd className="mt-1 text-lg font-bold sm:text-xl">
                {formatPrice(service.basePrice)}
              </dd>
            </div>

            {service.estimatedDuration && (
              <div className="min-w-0 rounded-xl border bg-card p-3.5 sm:p-4">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarClock className="size-3.5 shrink-0" />
                  <span className="truncate">Estimated Duration</span>
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold">
                  {service.estimatedDuration}
                </dd>
              </div>
            )}

            <div className="min-w-0 rounded-xl border bg-card p-3.5 sm:p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">Service Area</span>
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold">
                {service.serviceArea || "Not specified"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Sidebar: booking action + technician summary */}
      <aside className="flex min-w-0 flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
          <div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Starting at
            </p>
            <p className="text-2xl font-bold sm:text-3xl">
              {formatPrice(service.basePrice)}
            </p>
          </div>
          <RequestRepairSection
            serviceId={service._id}
            serviceTitle={service.title}
          />
        </div>

        {/* Technician summary card */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Technician
          </h2>

          <div className="mt-4 flex items-center gap-3">
            {technicianImageSrc ? (
              <Image
                src={technicianImageSrc}
                alt={service.technicianName || "Technician"}
                width={48}
                height={48}
                className="size-11 shrink-0 rounded-full border object-cover sm:size-12"
              />
            ) : (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:size-12 sm:text-sm">
                {getInitials(service.technicianName)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold sm:text-base">
                <span className="truncate">{service.technicianName}</span>
                <BadgeCheck className="size-4 shrink-0 text-primary" />
              </p>
              {service.technicianEmail && (
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground sm:text-sm">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{service.technicianEmail}</span>
                </p>
              )}
            </div>
          </div>

          <p className="mt-3 flex items-start gap-1.5 break-words text-xs text-muted-foreground sm:text-sm">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span>{service.serviceArea || "Service area not specified"}</span>
          </p>

          {service.technicianBio && (
            <p className="mt-3 break-words border-t pt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {service.technicianBio}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}