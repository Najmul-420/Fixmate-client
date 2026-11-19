"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Service } from "@/lib/types";
import ServiceCard from "@/components/home/ServiceCard";

const PAGE_SIZE = 6;

export default function PaginatedServicesGrid({
  services,
  filterKey,
}: {
  services: Service[];
  filterKey: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE));

  // সার্চ বা ফিল্টার পরিবর্তন হলে আবার ১ম পেজে ফিরে যাবে
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey, services.length]);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentServices = services.slice(startIndex, endIndex);

  const handleNext = () => {
    if (safePage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (safePage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1 col phone, 2 cols tablet, 3 cols laptop/desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {currentServices.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>

      {/* Pagination Controls: 6 per batch + Next button */}
      {services.length > PAGE_SIZE && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3.5 sm:flex-row">
          <p className="text-xs text-muted-foreground sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {startIndex + 1}–{Math.min(endIndex, services.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {services.length}
            </span>{" "}
            services (Page {safePage} of {totalPages})
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === safePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`size-9 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}