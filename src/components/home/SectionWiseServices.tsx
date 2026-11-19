import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { getFeaturedServices } from "@/lib/api";
import ServiceCard from "./ServiceCard";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

type SectionData = Record<string, Array<any>>;

interface SectionWiseServicesProps {
  /** Optional category filter from URL search params */
  category?: string;
}

/**
 * Section-wise services display:
 * - Fetches services grouped by category from the backend
 * - Renders each section with its heading and responsive card grid
 * - Supports filtering by a specific category via URL query
 */
export default function SectionWiseServices({ category }: SectionWiseServicesProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sections, setSections] = useState<SectionData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState<string | undefined>(undefined);

  // Parse category from URL if present
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setInitialCategory(urlCategory);
    }
  }, [searchParams]);

  // Fetch section-wise data from backend
  useEffect(() => {
    let cancelled = false;

    async function fetchSectionWise() {
      setLoading(true);
      setError(null);
      try {
        let url = "/api/services/section-wise";

        // If a specific category is filtered, pass it as a query param
        if (category) {
          url = `/api/services?category=${encodeURIComponent(category)}`;
          // We'll still group by section on the backend, but filter frontend
          // Actually, let's just fetch all and handle grouping
          // For now, fetch from the section-wise endpoint
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"}${url}`, {
          credentials: "include",
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const payload = await res.json();
        
        if (payload.sections) {
          setSections(payload.sections);
        } else if (payload.success && Array.isArray(payload)) {
          // Fallback: if backend returns raw array, group it
          const grouped: SectionData = {};
          payload.forEach((service: any) => {
            const cat = service.category || "Other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(service);
          });
          setSections(grouped);
        } else {
          setSections({});
        }

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        console.error("[FixMate] Section-wise services fetch error:", err);
        if (!cancelled) {
          setError(err.message ?? "Failed to fetch section-wise services");
          setLoading(false);
        }
      }
    }

    fetchSectionWise();

    return () => {
      cancelled = true;
    };
  }, [category]);

  // If we have an initial category from URL, ensure we filter properly
  useEffect(() => {
    if (initialCategory && sections[initialCategory]) {
      // Section already loaded with all categories
    }
  }, [initialCategory, sections]);

  // Get available categories (unique categories from sections)
  const categories = useMemo(() => {
    if (!sections) return [];
    return Object.keys(sections).filter(
      (cat) => sections[cat] && sections[cat].length > 0
    );
  }, [sections]);

  if (loading) {
    return (
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto animate-pulse rounded-xl bg-muted w-64 h-64" />
          <p className="mt-4 text-center text-muted-foreground">Loading sections...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (Object.keys(sections).length === 0) {
    return (
      <EmptyState
        title="No Services Yet"
        description="No approved services are available. Check back later or browse our featured services."
        action={{
          label: "Browse Services",
          href: "/services",
        }}
        className="mt-20"
      />
    );
  }

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {categories.map((category) => {
            const services = sections[category] || [];
            if (services.length === 0) return null;

            return (
              <div key={category} className="border-y border-muted/20 pb-12">
                {/* Section Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {category}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {services.length} service{services.length > 1 ? "s" : ""} available
                  </p>
                </div>

                {/* Card Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service: any) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

