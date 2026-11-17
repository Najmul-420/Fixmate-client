import type { Metadata } from "next";
import AdminOverview from "@/components/dashboard/AdminOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard | FixMate",
};

export default function AdminDashboardPage() {
  return <AdminOverview />;
}
