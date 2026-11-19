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
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

/** Express backend base URL — set NEXT_PUBLIC_API_BASE_URL in .env to override. */
const API_ENABLED = true;

/**
 * Extracts an array from a backend payload whether it responds with a bare
 * array or an envelope like `{ data: [...] }` or `{ services: [...] }`.
 */
function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    for (const key of ["services", "bookings", "payments", "users", "data"]) {
      const val = (payload as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
}

/** Session headers read from the Next.js BetterAuth session for Express auth. */
export function sessionHeaders(
  email: string,
  role: string,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-user-email": email,
    "x-user-role": role,
  };
}

/** Unified GET helper: fails fast (4s) and always resolves to an array. */
async function fetchList<T>(
  path: string,
  warnLabel: string,
  extraHeaders?: Record<string, string>,
): Promise<T[]> {
  if (!API_ENABLED) return [];
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...extraHeaders },
      credentials: "include",
      cache: "no-store",
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
 * Always resolves to an array — an empty `[]` means "no data available yet".
 */
// export async function fetchApprovedServices(
//   query: ServiceQuery = {},
// ): Promise<Service[]> {
//   if (!API_ENABLED) return [];

//   const params = new URLSearchParams({ status: "approved" });
//   if (query.search) params.set("search", query.search);
//   if (query.category) params.set("category", query.category);
//   if (query.serviceMode) params.set("serviceMode", query.serviceMode);
//   if (query.sort) params.set("sort", query.sort);
//   if (query.limit) params.set("limit", String(query.limit));

//   try {
//     const res = await fetch(`${API_BASE}/api/services?${params.toString()}`, {
//       headers: { "Content-Type": "application/json" },
//       cache: "no-store",
//       signal: AbortSignal.timeout(4_000),
//     });
//     if (!res.ok) return [];

//     const payload: unknown = await res.json();
//     const list: Service[] = toArray<Service>(payload);

//     return list.filter(
//       (service) =>
//         Boolean(service?._id) &&
//         service.approvalStatus === "approved" &&
//         service.isAvailable !== false,
//     );
//   } catch (error) {
//     console.warn("[FixMate] Services API unavailable:", error);
//     return [];
//   }
// }
export async function fetchApprovedServices(
  query: ServiceQuery = {},
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
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return [];

    const payload: unknown = await res.json();
    const list: Service[] = toArray<Service>(payload);

    const approved = list.filter(
      (service) =>
        Boolean(service?._id) &&
        service.approvalStatus === "approved" &&
        service.isAvailable !== false,
    );

    const sorted = sortServices(approved, query.sort);
    return typeof query.limit === "number" && query.limit > 0
      ? sorted.slice(0, query.limit)
      : sorted;
  } catch (error) {
    console.warn("[FixMate] Services API unavailable:", error);
    return [];
  }
}

/**
 * Fetches all available services across statuses (approved, pending, etc.)
 * for the public Services listing page.
 */
export async function fetchAllAvailableServices(
  query: Omit<ServiceQuery, "limit"> = {},
): Promise<Service[]> {
  if (!API_ENABLED) return [];

  const params = new URLSearchParams({ status: "all" });
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.serviceMode) params.set("serviceMode", query.serviceMode);
  if (query.sort) params.set("sort", query.sort);

  try {
    const res = await fetch(`${API_BASE}/api/services?${params.toString()}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return [];

    const payload: unknown = await res.json();
    const list: Service[] = toArray<Service>(payload);

    const available = list.filter(
      (service) => Boolean(service?._id) && service.isAvailable !== false,
    );

    return sortServices(available, query.sort);
  } catch (error) {
    console.warn("[FixMate] All services API unavailable:", error);
    return [];
  }
}

/**
 * All bookings, optionally scoped to one customer or technician.
 */
export async function fetchBookings(
  scope: {
    customerEmail?: string;
    technicianEmail?: string;
  } = {},
): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (scope.customerEmail) params.set("customerEmail", scope.customerEmail);
  if (scope.technicianEmail)
    params.set("technicianEmail", scope.technicianEmail);
  const qs = params.toString();
  const bookings = await fetchList<Booking>(
    `/api/bookings${qs ? `?${qs}` : ""}`,
    "Bookings API",
  );
  return bookings.filter((booking) => Boolean(booking?._id));
}

/**
 * Creates a new service (technician action). Starts as `pending` approval
 * server-side. Returns the created service, or `null` on failure.
 */
export async function createService(
  input: Omit<Service, "_id" | "approvalStatus"> & {
    approvalStatus?: ApprovalStatus;
  },
  session?: { email: string; role: string },
): Promise<Service | null> {
  if (!API_ENABLED) return null;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/services`, {
      method: "POST",
      headers,
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    const service =
      (Array.isArray(payload)
        ? undefined
        : ((payload as { data?: Service; service?: Service }).data ??
          (payload as { service?: Service }).service)) ?? (payload as Service);
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
  patch: Partial<Service>,
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`, {
      method: "PATCH",
      headers,
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
export async function deleteService(
  serviceId: string,
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {};
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`, {
      method: "DELETE",
      headers,
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
 * Advances a booking through the job status pipeline (technician action).
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  finalAmount?: number,
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(
        status === "completed" ? { status, finalAmount } : { status },
      ),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Booking status update failed:", error);
    return false;
  }
}

/** All Stripe payment records (customer history / admin transactions). */
export async function fetchPayments(
  scope: { customerEmail?: string; technicianEmail?: string } = {},
): Promise<Payment[]> {
  const params = new URLSearchParams();
  if (scope.customerEmail) params.set("customerEmail", scope.customerEmail);
  if (scope.technicianEmail)
    params.set("technicianEmail", scope.technicianEmail);
  const qs = params.toString();
  const payments = await fetchList<Payment>(
    `/api/payments${qs ? `?${qs}` : ""}`,
    "Payments API",
  );
  return payments.filter((payment) => Boolean(payment?._id));
}

/**
 * Cancels a pending booking (customer action, only valid while the job is
 * still `requested`). PATCHes the status server-side.
 */
export async function cancelBooking(
  bookingId: string,
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers,
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
 * Creates a new booking (customer action).
 */
export async function createBooking(
  input: {
    serviceId: string;
    customerPhone: string;
    address: string;
    preferredDate: string;
    problemDescription: string;
  },
  session: { email: string; role: string; name?: string },
): Promise<{ success: boolean; message?: string }> {
  if (!API_ENABLED) return { success: true };
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": session.email,
        "x-user-role": session.role,
      },
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify(input),
    });
    const payload: unknown = await res.json();
    if (!res.ok) {
      const msg =
        (payload as { message?: string } | null)?.message ??
        "Failed to submit booking.";
      return { success: false, message: msg };
    }
    return { success: true };
  } catch (error) {
    console.warn("[FixMate] Create booking failed:", error);
    return { success: false, message: "Network error. Please try again." };
  }
}

/**
 * Starts a Stripe Checkout session for a completed-but-unpaid booking.
 */
export async function createCheckoutSession(
  bookingId: string,
): Promise<string | null> {
  if (!API_ENABLED) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/payments/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({ bookingId }),
      },
    );
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
    "Users API",
  );
  return users
    .filter((user) => Boolean(user?._id ?? user?.id))
    .map((user) => ({ ...user, _id: user._id ?? user.id! }));
}

/**
 * Changes a user's role (admin action). PATCHes the user record.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole,
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: "PATCH",
      headers,
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
 * Updates a service approval status (admin moderation action).
 */
export async function updateServiceApproval(
  serviceId: string,
  approvalStatus: "approved" | "rejected",
  session?: { email: string; role: string },
): Promise<boolean> {
  if (!API_ENABLED) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) {
      headers["x-user-email"] = session.email;
      headers["x-user-role"] = session.role;
    }
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      signal: AbortSignal.timeout(8_000),
      body: JSON.stringify({ approvalStatus }),
    });
    return res.ok;
  } catch (error) {
    console.warn("[FixMate] Service approval update failed:", error);
    return false;
  }
}

/**
 * Fetches services without filtering by approval, optionally scoped to one
 * technician.
 */
export async function fetchServices(
  scope: { technicianEmail?: string } = {},
): Promise<Service[]> {
  const params = new URLSearchParams();
  if (scope.technicianEmail)
    params.set("technicianEmail", scope.technicianEmail);
  const services = await fetchList<Service>(
    `/api/services${params.toString() ? `?${params}` : ""}`,
    "Services API",
  );
  return services.filter((service) => Boolean(service?._id));
}

/** Home page shortcut: latest N approved services (newest first). */
export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  const services = await fetchApprovedServices({ sort: "newest", limit });
  return sortServices(services, "newest").slice(0, limit);
}

/**
 * Fetches services grouped by category/section from the backend.
 */
export async function fetchSectionWiseServices(): Promise<
  Record<string, Service[]>
> {
  if (!API_ENABLED) return {};
  try {
    const res = await fetch(`${API_BASE}/api/services/section-wise`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return {};
    const payload: unknown = await res.json();

    const rawSections =
      payload && typeof payload === "object"
        ? (payload as { sections?: Record<string, unknown> }).sections
        : undefined;

    if (rawSections && typeof rawSections === "object") {
      const sections: Record<string, Service[]> = {};
      for (const [category, services] of Object.entries(rawSections)) {
        if (!Array.isArray(services)) continue;
        const filtered = (services as Service[]).filter(
          (s) =>
            Boolean(s?._id) &&
            s.approvalStatus === "approved" &&
            s.isAvailable !== false,
        );
        if (filtered.length > 0) {
          sections[category] = filtered;
        }
      }
      return sections;
    }

    return {};
  } catch (error) {
    console.warn("[FixMate] Section-wise services API unavailable:", error);
    return {};
  }
}

/**
 * Fetches a single service by id for the details page.
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
    const service =
      (Array.isArray(payload)
        ? undefined
        : ((payload as { data?: Service; service?: Service }).data ??
          (payload as { service?: Service }).service)) ?? (payload as Service);

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
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      );
  }
}

/**
 * Client-side filtering over the fetched list (by title/category search,
 * category, service mode).
 */
export function filterServices(
  services: Service[],
  query: Pick<ServiceQuery, "search" | "category" | "serviceMode">,
): Service[] {
  const search = query.search?.trim().toLowerCase();

  return services.filter((service) => {
    if (search) {
      const haystack = `${service.title} ${service.category}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (query.category && service.category !== query.category) return false;
    if (query.serviceMode && service.serviceMode !== query.serviceMode)
      return false;
    return true;
  });
}
