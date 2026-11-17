import type { Metadata } from "next";
import CustomerOverview from "@/components/dashboard/CustomerOverview";

export const metadata: Metadata = {
  title: "Customer Dashboard | FixMate",
};

export default function CustomerDashboardPage() {
  return <CustomerOverview />;
}
