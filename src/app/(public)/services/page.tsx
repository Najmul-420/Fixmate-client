import { Suspense } from "react";
import { connection } from "next/server";
import { SlidersHorizontal } from "lucide-react";
import {
  fetchApprovedServices,
  filterServices,
  sortServices,
} from "@/lib/api";
import EmptyState from "@/components/shared/EmptyState";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/home/ServiceCard";
import ServiceFilterBar from "@/components/services/ServiceFilterBar";

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string): string {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

async function ServicesResult({ searchParams }: { searchParams: SearchParams }) {
  await connection();

  const search = readParam(searchParams, "search");
  const category = readParam(searchParams, "category");
  const serviceMode = readParam(searchParams, "serviceMode");
  const sort = readParam(searchParams, "sort") || "newest";

  const fetched = await fetchApprovedServices({ sort });

  let services: Service[] = filterServices(fetched, {
    search,
    category,
    serviceMode,
  });
  services = sortServices(services, sort);

  const hasFilters = Boolean(search || category || serviceMode);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Result summary */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <SlidersHorizontal className="size-4 shrink-0" />
        <span>
          {services.length === 0
            ? "No services found"
            : `Showing ${services.length} service${services.length === 1 ? "" : "s"}`}
        </span>
        {hasFilters && (
          <span className="break-words text-foreground/70">
            {[search && `“${search}”`, category, serviceMode]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}
      </div>

      {/* Grid: 1 col phone, 2 cols tablet, 3 cols laptop & desktop */}
      {services.length === 0 ? (
        <EmptyState
          title="No services match your search"
          description={
            hasFilters
              ? "Try a different keyword or clear some filters — new services are added by technicians all the time."
              : "No approved services have been published yet. Please check back soon."
          }
          action={
            hasFilters
              ? { label: "Clear all filters", href: "/services" }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesResultSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-xl border bg-muted"
        />
      ))}
    </div>
  );
}

export const metadata = {
  title: "Browse Services | FixMate",
  description:
    "Browse approved repair services from verified technicians — filter by category, service mode and price.",
};

export default function BrowseServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Browse Services
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Find trusted repair services for every device — searched, filtered
          and sorted on the server.
        </p>
      </div>

      {/* Filter bar */}
      <Suspense
        fallback={
          <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-muted sm:mt-8" />
        }
      >
        <FilterBarFromParams searchParams={searchParams} />
      </Suspense>

      {/* Results */}
      <div className="mt-6 sm:mt-8">
        <Suspense fallback={<ServicesResultSkeleton />}>
          <ResultFromParams searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FilterBarFromParams({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <div className="mt-6 rounded-xl border bg-muted/40 p-3.5 sm:mt-8 sm:p-4">
      <ServiceFilterBar
        search={readParam(params, "search")}
        category={readParam(params, "category")}
        serviceMode={readParam(params, "serviceMode")}
        sort={readParam(params, "sort") || "newest"}
      />
    </div>
  );
}

async function ResultFromParams({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return <ServicesResult searchParams={params} />;
}