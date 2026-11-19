import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
 
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  
  fetchOptions: {
    credentials: "include",
  },
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
