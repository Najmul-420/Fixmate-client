import type {
  AdminUser,
  ApprovalStatus,
  Booking,
  BookingStatus,
  Payment,
  Service,
} from "./types";
import type { UserRole } from "./auth-client";

/**
 * Base URL of the FixMate Express backend.
 * Configure NEXT_PUBLIC_API_BASE_URL in .env (defaults to the local dev server).
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/**
 * The Express backend is not built yet. While disabled, every read resolves
 * immediately with an empty result and no network request is attempted, so
 * the UI runs on local state alone.
 *
 * TODO: Connect API — set this to `true` (and configure
 * NEXT_PUBLIC_API_BASE_URL) once the backend is available.
 */
const API_ENABLED = false;

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
  if (!API_ENABLED) return [];
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
  if (!API_ENABLED) return [];

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

/**
 * Creates a new service (technician action). Starts as `pending` approval
 * server-side. Returns the created service, or `null` on failure.
 */
export async function createService(
  input: Omit<Service, "_id" | "approvalStatus"> & { approvalStatus?: ApprovalStatus }
): Promise<Service | null> {
  if (!API_ENABLED) return null;
  try {
    const res = await fetch(`${API_BASE}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    const service = (
      Array.isArray(payload) ? undefined : (payload as { data?: Service }).data
    ) ?? (payload as Service);
    return service?._id ? service : null;
  } catch (error) {
    console.warn("[FixMate] Create service failed:", error);
    return null;
  }
}

/**
 * Updates a service (technician edit / availability toggle). Accepts a
 * partial patch. Returns true when the backend confirms.
 */
export async function updateService(
  serviceId: string,
  patch: Partial<Service>
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Update service failed:", error);
    return false;
  }
}

/** Deletes a service (technician action). Returns true when confirmed. */
export async function deleteService(serviceId: string): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`, {
      method: "DELETE",
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Delete service failed:", error);
    return false;
  }
}

/**
 * Advances a booking through the job status pipeline (technician action):
 * requested -> accepted/rejected, accepted -> in-progress,
 * in-progress -> completed (+ finalAmount > 0).
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  finalAmount?: number
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(
        status === "completed" ? { status, finalAmount } : { status }
      ),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Booking status update failed:", error);
    return false;
  }
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
  if (!API_ENABLED) return false;
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
  if (!API_ENABLED) return null;
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
  const users = await fetchList<AdminUser & { id?: string }>(
    "/api/users",
    "Users API"
  );
  // Accept either Mongo `_id` or BetterAuth `id` so no users are dropped.
  return users
    .filter((user) => Boolean(user?._id ?? user?.id))
    .map((user) => ({ ...user, _id: user._id ?? user.id! }));
}

/**
 * Changes a user's role (admin action). PATCHes the user record.
 * Returns true when the backend confirms the change.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ role }),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Role update failed:", error);
    return false;
  }
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
  if (!API_ENABLED) return null;
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
