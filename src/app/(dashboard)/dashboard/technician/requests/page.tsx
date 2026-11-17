import type { Metadata } from "next";
import TechnicianRequests from "@/components/dashboard/TechnicianRequests";

export const metadata: Metadata = {
  title: "Manage Requests | FixMate",
};

export default function TechnicianRequestsPage() {
  return <TechnicianRequests />;
}
