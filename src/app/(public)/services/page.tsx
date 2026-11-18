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
  // Opt into dynamic rendering: the result list depends on the request's
  // search params and on live backend data. Without this marker, Cache
  // Components would prerender the fetch (whose timeout uses `Date.now()`).
  await connection();

  const search = readParam(searchParams, "search");
  const category = readParam(searchParams, "category");
  const serviceMode = readParam(searchParams, "serviceMode");
  const sort = readParam(searchParams, "sort") || "newest";

  // Latest approved services; an empty array (e.g. backend not running yet)
  // renders the friendly empty state below.
  const fetched = await fetchApprovedServices({ sort });

  // Search, filter and sort server-side.
  let services: Service[] = filterServices(fetched, { search, category, serviceMode });
  services = sortServices(services, sort);

  const hasFilters = Boolean(search || category || serviceMode);

  return (
    <>
      {/* Result summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        {services.length === 0
          ? "No services found"
          : `Showing ${services.length} service${services.length === 1 ? "" : "s"}`}
        {hasFilters && (
          <span className="text-foreground/70">
            {[
              search && `“${search}”`,
              category,
              serviceMode,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        )}
      </div>

      {/* Grid: 1 col mobile, 2 tablet, 3–4 desktop */}
      {services.length === 0 ? (
        <EmptyState
          title="No services match your search"
          description={
            hasFilters
              ? "Try a different keyword or clear some filters — new services are added by technicians all the time."
              : "No approved services have been published yet. Please check back soon."
          }
          action={hasFilters ? { label: "Clear all filters", href: "/services" } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </>
  );
}

function ServicesResultSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-xl border bg-muted" />
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Browse Services
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find trusted repair services for every device — searched, filtered
          and sorted on the server.
        </p>
      </div>

      {/* Filter bar (submits as GET params; filtering happens server-side) */}
      <Suspense fallback={<div className="mt-8 h-10 w-full animate-pulse rounded-lg bg-muted" />}>
        <FilterBarFromParams searchParams={searchParams} />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
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
    <div className="mt-8 rounded-xl border bg-muted/40 p-4">
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
