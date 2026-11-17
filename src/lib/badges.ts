import type { UserRole } from "./auth-client";
import type { BookingStatus } from "./types";

/**
 * Shared role badge styling (used by the Navbar and the Dashboard topbar)
 * so role chips look identical across the whole app.
 */
export const roleBadgeStyles: Record<UserRole, string> = {
  customer:
    "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA]",
  technician:
    "bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#34D399]",
  admin: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
};

/** Human-friendly label for a role value. */
export function roleLabel(role?: UserRole | null) {
  switch (role) {
    case "technician":
      return "Technician";
    case "admin":
      return "Admin";
    case "customer":
      return "Customer";
    default:
      return "User";
  }
}

/** Badge styling per booking status (used across dashboard pages). */
export const bookingStatusStyles: Record<BookingStatus, string> = {
  requested:
    "bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA]",
  accepted:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  completed:
    "bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#34D399]",
  cancelled: "bg-muted text-muted-foreground",
};

/** Badge styling per payment status. */
export const paymentStatusStyles: Record<"paid" | "unpaid", string> = {
  paid: "bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#34D399]",
  unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};
