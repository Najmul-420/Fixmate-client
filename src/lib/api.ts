import type {
  AdminUser,
  Booking,
  Payment,
  Service,
} from "./types";

/**
 * Base URL of the FixMate Express backend.
 * Configure NEXT_PUBLIC_API_BASE_URL in .env (defaults to the local dev server).
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/**
 * Extracts an array from a backend payload whether it responds with a bare
 * array or an envelope like `{ data: [...] }`.
 */
function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const data = (payload as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}

/** Unified GET helper: fails fast (4s) and always resolves to an array. */
async function fetchList<T>(path: string, warnLabel: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      // Fail fast when the backend is not running instead of hanging the page.
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return [];
    const payload: unknown = await res.json();
    return toArray<T>(payload);
  } catch (error) {
    console.warn(`[FixMate] ${warnLabel} unavailable:`, error);
    return [];
  }
}

export type ServiceQuery = {
  search?: string;
  category?: string;
  serviceMode?: string;
  /** "price_asc" | "price_desc" | "newest" */
  sort?: string;
  limit?: number;
};

/**
 * Fetches approved & available services from the backend.
 * Always resolves to an array — an empty `[]` means "no data available yet"
 * (backend unreachable, non-OK response, or genuinely empty), so callers can
 * render empty states instead of breaking.
 */
export async function fetchApprovedServices(
  query: ServiceQuery
): Promise<Service[]> {
  const params = new URLSearchParams({ status: "approved" });
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.serviceMode) params.set("serviceMode", query.serviceMode);
  if (query.sort) params.set("sort", query.sort);
  if (query.limit) params.set("limit", String(query.limit));

  try {
    const res = await fetch(`${API_BASE}/api/services?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      // Fail fast when the backend is not running instead of hanging the page.
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return [];

    const payload: unknown = await res.json();
    const list: Service[] = Array.isArray(payload)
      ? (payload as Service[])
      : Array.isArray((payload as { data?: Service[] }).data)
        ? (payload as { data: Service[] }).data
        : [];

    return list.filter(
      (service) =>
        service.approvalStatus === "approved" && service.isAvailable !== false
    );
  } catch (error) {
    console.warn("[FixMate] Services API unavailable:", error);
    return [];
  }
}

/**
 * All bookings, optionally scoped to one customer or technician.
 * Intended backend contract:
 *   GET /api/bookings                     (admin)
 *   GET /api/bookings?customerEmail=...   (customer)
 *   GET /api/bookings?technicianEmail=... (technician)
 */
export async function fetchBookings(scope: {
  customerEmail?: string;
  technicianEmail?: string;
} = {}): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (scope.customerEmail) params.set("customerEmail", scope.customerEmail);
  if (scope.technicianEmail) params.set("technicianEmail", scope.technicianEmail);
  const qs = params.toString();
  const bookings = await fetchList<Booking>(
    `/api/bookings${qs ? `?${qs}` : ""}`,
    "Bookings API"
  );
  // Defensive: only return well-formed bookings.
  return bookings.filter((booking) => Boolean(booking?._id));
}

/** All Stripe payment records (customer history / admin transactions). */
export async function fetchPayments(): Promise<Payment[]> {
  const payments = await fetchList<Payment>("/api/payments", "Payments API");
  return payments.filter((payment) => Boolean(payment?._id));
}

/**
 * Cancels a pending booking (customer action, only valid while the job is
 * still `requested`). PATCHes the status server-side.
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ status: "cancelled" }),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Booking cancel failed:", error);
    return false;
  }
}

/**
 * Starts a Stripe Checkout session for a completed-but-unpaid booking.
 * Returns the hosted checkout URL, or `null` when the backend is
 * unreachable / refuses (callers surface an error, never a fake success).
 */
export async function createCheckoutSession(
  bookingId: string
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    const url =
      (payload as { url?: unknown } | null)?.url ??
      (payload as { data?: { url?: unknown } } | null)?.data?.url;
    return typeof url === "string" && url.startsWith("http") ? url : null;
  } catch (error) {
    console.warn("[FixMate] Checkout session failed:", error);
    return null;
  }
}

/** All platform users (admin "Manage Users" + overview counts). */
export async function fetchUsers(): Promise<AdminUser[]> {
  const users = await fetchList<AdminUser>("/api/users", "Users API");
  return users.filter((user) => Boolean(user?._id));
}

/**
 * Fetches services without filtering by approval, optionally scoped to one
 * technician — used by the technician dashboard ("My Services") and the
 * admin overview ("Total Services").
 *   GET /api/services?technicianEmail=...
 */
export async function fetchServices(scope: { technicianEmail?: string } = {}): Promise<Service[]> {
  const params = new URLSearchParams();
  if (scope.technicianEmail) params.set("technicianEmail", scope.technicianEmail);
  const services = await fetchList<Service>(
    `/api/services${params.toString() ? `?${params}` : ""}`,
    "Services API"
  );
  return services.filter((service) => Boolean(service?._id));
}

/** Home page shortcut: latest N approved services (newest first). */
export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const services = await fetchApprovedServices({ sort: "newest", limit });
  return sortServices(services, "newest").slice(0, limit);
}

/**
 * Fetches a single service by id for the details page.
 * Returns `null` when the service does not exist, is not approved,
 * is unavailable, or the backend is unreachable — callers render notFound().
 */
export async function getServiceById(id: string): Promise<Service | null> {
  try {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    const service = (
      Array.isArray(payload) ? undefined : (payload as { data?: Service }).data
    ) ?? (payload as Service);

    if (!service?._id) return null;
    if (service.approvalStatus !== "approved") return null;
    if (service.isAvailable === false) return null;
    return service;
  } catch (error) {
    console.warn("[FixMate] Services API unavailable:", error);
    return null;
  }
}

/** Defensive client-side sorting (mirrors the backend `sort` contract). */
export function sortServices(services: Service[], sort?: string): Service[] {
  const sorted = [...services];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.basePrice - b.basePrice);
    case "price_desc":
      return sorted.sort((a, b) => b.basePrice - a.basePrice);
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
  }
}

/**
 * Server-side filtering over the fetched list (by title/category search,
 * category, service mode). Applied defensively so results are correct
 * even before the backend implements the query params.
 */
export function filterServices(
  services: Service[],
  query: Pick<ServiceQuery, "search" | "category" | "serviceMode">
): Service[] {
  const search = query.search?.trim().toLowerCase();

  return services.filter((service) => {
    if (search) {
      const haystack = `${service.title} ${service.category}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (query.category && service.category !== query.category) return false;
    if (query.serviceMode && service.serviceMode !== query.serviceMode) return false;
    return true;
  });
}
