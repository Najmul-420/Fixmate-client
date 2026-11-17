import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type UserRole = "customer" | "technician" | "admin";

export type FixMateUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole | null;
};

export const { useSession } = authClient;
