import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
// Type-only import: brings the shape of the custom `role` field into the
// client without pulling the server auth config (MongoDB) into the bundle.
import type { auth } from "./auth";

export const authClient = createAuthClient({
  // Same-origin by default (BetterAuth is served from /api/auth in this app).
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

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
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
};

export const { signIn, signUp, useSession } = authClient;
