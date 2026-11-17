"use client";

import { RotateCcw, Search } from "lucide-react";
import type { ServiceCategory, ServiceMode } from "@/lib/types";

const CATEGORIES: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const SERVICE_MODES: ServiceMode[] = ["Home Visit", "Shop Drop-off"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const selectClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none sm:w-auto";

type Props = {
  search: string;
  category: string;
  serviceMode: string;
  sort: string;
};

/**
 * Client-side form that submits to the same route as GET query params —
 * the actual searching/filtering/sorting happens on the server.
 */
export default function ServiceFilterBar({
  search,
  category,
  serviceMode,
  sort,
}: Props) {
  return (
    <form action="/services" method="get" className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search by title or category..."
            aria-label="Search services"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none"
          />
        </div>

        {/* Category */}
        <select
          name="category"
          defaultValue={category}
          aria-label="Filter by category"
          className={selectClasses}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Service mode */}
        <select
          name="serviceMode"
          defaultValue={serviceMode}
          aria-label="Filter by service mode"
          className={selectClasses}
        >
          <option value="">All Service Modes</option>
          {SERVICE_MODES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort services"
          className={selectClasses}
        >
          {SORT_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Search className="size-4" />
            Apply
          </button>
          <a
            href="/services"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Reset filters"
          >
            <RotateCcw className="size-4" />
            Reset
          </a>
        </div>
      </div>
    </form>
  );
}
