import type { Metadata } from "next";
import TechnicianOverview from "@/components/dashboard/TechnicianOverview";

export const metadata: Metadata = {
  title: "Technician Dashboard | FixMate",
};

export default function TechnicianDashboardPage() {
  return <TechnicianOverview />;
}
