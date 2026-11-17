import type { UserRole } from "./auth-client";

export type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

/** Runtime lists for dropdowns / segmented controls. */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

export const SERVICE_MODES: ServiceMode[] = ["Home Visit", "Shop Drop-off"];

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Service = {
  _id: string;
  title: string;
  category: ServiceCategory;
  description?: string;
  image: string;
  basePrice: number;
  estimatedDuration?: string;
  serviceMode: ServiceMode;
  serviceArea?: string;
  technicianName: string;
  technicianEmail?: string;
  /** Optional technician profile fields, when the API provides them. */
  technicianImage?: string | null;
  technicianBio?: string | null;
  approvalStatus: ApprovalStatus;
  isAvailable?: boolean;
  createdAt?: string;
};

/** Lifecycle of a repair job (see AGENTS.md job status pipeline). */
export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

/** Statuses that count as an "active" job. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "requested",
  "accepted",
  "in-progress",
];

export type Booking = {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: ServiceCategory;
  basePrice?: number;
  technicianName?: string;
  technicianEmail?: string;
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  preferredDate?: string;
  problemDescription?: string;
  status: BookingStatus;
  /** Set by the technician when the job is completed (> 0). */
  finalAmount?: number | null;
  paymentStatus?: "unpaid" | "paid";
  createdAt?: string;
};

export type Payment = {
  _id: string;
  bookingId?: string;
  serviceTitle?: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  amount: number;
  currency?: "usd" | string;
  transactionId?: string;
  stripeSessionId?: string;
  paymentStatus?: "paid";
  paidAt?: string;
};

/** Admin-facing user record (BetterAuth user + role fields). */
export type AdminUser = {
  _id: string;
  name?: string;
  email: string;
  image?: string | null;
  role?: UserRole;
  phone?: string;
  area?: string;
  createdAt?: string;
};
