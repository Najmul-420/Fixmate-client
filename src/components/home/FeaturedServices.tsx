import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connection } from "next/server";
import { getFeaturedServices } from "@/lib/api";
import EmptyState from "@/components/shared/EmptyState";
import ServiceCard from "./ServiceCard";

/** Streamed in while the latest services are being fetched. */
export function FeaturedServicesSkeleton() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function FeaturedServices() {
  // Opt into dynamic rendering so the latest services are fetched on every
  // request (Cache Components requires an explicit dynamic marker).
  await connection();

  const services = await getFeaturedServices(6);

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Services
            </h2>
            <p className="mt-2 text-muted-foreground">
              The 6 latest approved services from our verified technicians.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          >
            View All Services
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {services.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No services yet"
            description="Approved services will appear here as soon as technicians publish them."
          />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
