import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type UserRole = "customer" | "technician" | "admin";

/** Role-aware dashboard path used by the navbar and auth redirects. */
export function getDashboardPath(role?: UserRole | null) {
  switch (role) {
    case "technician":
      return "/dashboard/technician";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/customer";
  }
}

export type FixMateUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole | null;
};

export const { useSession } = authClient;
