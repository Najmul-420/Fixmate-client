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

function getInitials(name: string) {
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
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <div className="aspect-[16/9] w-full animate-pulse rounded-2xl border bg-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="h-44 w-full animate-pulse rounded-2xl border bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-2xl border bg-muted" />
      </div>
    </div>
  );
}

export default function ServiceDetailsPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Services
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Services
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-medium text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#3B82F6]">
                {service.serviceMode === "Home Visit" ? (
                  <House className="size-3" />
                ) : (
                  <Store className="size-3" />
                )}
                {service.serviceMode}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {service.title}
            </h1>

            {service.description && (
              <p className="leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            )}

            {/* Specs grid — each item renders only when the API provides it */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card p-4">
                <dt className="text-xs font-medium text-muted-foreground">Starting Price</dt>
                <dd className="mt-1 text-xl font-bold">
                  {formatPrice(service.basePrice)}
                </dd>
              </div>
              {service.estimatedDuration && (
                <div className="rounded-xl border bg-card p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Estimated Duration
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {service.estimatedDuration}
                  </dd>
                </div>
              )}
              <div className="rounded-xl border bg-card p-4">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="size-3.5" />
                  Service Area
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {service.serviceArea || "Not specified"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar: booking action + technician summary */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-3xl font-bold">
                {formatPrice(service.basePrice)}
              </p>
            </div>
            <RequestRepairSection
              serviceId={service._id}
              serviceTitle={service.title}
            />
          </div>

          {/* Technician summary card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Technician
            </h2>
            <div className="mt-4 flex items-center gap-3">
              {service.technicianImage ? (
                <Image
                  src={service.technicianImage}
                  alt={service.technicianName}
                  width={48}
                  height={48}
                  className="size-12 rounded-full border object-cover"
                />
              ) : (
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(service.technicianName)}
                </span>
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate font-semibold">
                  {service.technicianName}
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                </p>
                {service.technicianEmail && (
                  <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" />
                    {service.technicianEmail}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {service.serviceArea || "Service area not specified"}
            </p>
            {service.technicianBio && (
              <p className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
                {service.technicianBio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
