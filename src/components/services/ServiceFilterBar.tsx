"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import { Loader2, RotateCcw, Search } from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const selectClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none disabled:opacity-60 sm:w-auto";

type Props = {
  search: string;
  category: string;
  serviceMode: string;
  sort: string;
};

/**
 * Filter controls that write straight into the URL query params. The server
 * component reads those params to search, filter and sort, so a refresh or a
 * shared link keeps the exact same view.
 */
export default function ServiceFilterBar({
  search,
  category,
  serviceMode,
  sort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const typedSearch = () => {
    if (!formRef.current) return "";
    return String(new FormData(formRef.current).get("search") ?? "").trim();
  };

  const navigate = (params: URLSearchParams, mode: "push" | "replace") => {
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const value = typedSearch();
    if (value) params.set("search", value);
    else params.delete("search");
    navigate(params, "push");
  };

  const handleSelect = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    // Keep whatever the user has typed in the search box when they change a
    // dropdown (it may not have been submitted yet).
    const pendingSearch = typedSearch();
    if (pendingSearch) params.set("search", pendingSearch);
    else params.delete("search");

    navigate(params, "replace");
  };

  const hasFilters = Boolean(search || category || serviceMode);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      role="search"
      className="w-full"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:min-w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            key={search}
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
          value={category}
          onChange={(event) => handleSelect("category", event.target.value)}
          disabled={pending}
          aria-label="Filter by category"
          className={selectClasses}
        >
          <option value="">All Categories</option>
          {SERVICE_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Service mode */}
        <select
          value={serviceMode}
          onChange={(event) => handleSelect("serviceMode", event.target.value)}
          disabled={pending}
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
          value={sort}
          onChange={(event) => handleSelect("sort", event.target.value)}
          disabled={pending}
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
            disabled={pending}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {pending ? "Applying…" : "Apply"}
          </button>
          <Link
            href="/services"
            aria-disabled={!hasFilters}
            title="Reset filters"
            className={
              hasFilters
                ? "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                : "pointer-events-none inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium text-muted-foreground opacity-50"
            }
          >
            <RotateCcw className="size-4" />
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
