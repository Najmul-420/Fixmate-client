import { Suspense } from "react";
import SectionWiseServices from "@/components/home/SectionWiseServices";
import { getFeaturedServices } from "@/lib/api";
import FeaturedServicesSkeleton from "@/components/home/FeaturedServices";
import { connection } from "next/server";

export const metadata = {
  title: "Section-wise Services | FixMate",
  description:
    "Browse approved repair services organized by category/section — smartphones, laptops, ACs, and more.",
};

export default async function SectionWiseServicesPage() {
  // Opt into dynamic rendering so the section-wise data is fetched on every request.
  await connection();

  // Fetch featured services for the hero/above-the-fold section
  const featured = await getFeaturedServices(6);

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Section-wise services card grid */}
          <Suspense fallback={<FeaturedServicesSkeleton />}>
            <SectionWiseServices />
          </Suspense>

          {/* Featured services sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Services
            </h2>
            <p className="text-muted-foreground">
              The 6 latest approved services from our verified technicians.
            </p>
            <Suspense fallback={<FeaturedServicesSkeleton minHeight={200} />}>
              <FeaturedServices />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}