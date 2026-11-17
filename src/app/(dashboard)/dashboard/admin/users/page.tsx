import type { Metadata } from "next";
import AdminUsers from "@/components/dashboard/AdminUsers";

export const metadata: Metadata = {
  title: "Manage Users | FixMate",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
