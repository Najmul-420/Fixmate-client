import type { Metadata } from "next";
import AdminServices from "@/components/dashboard/AdminServices";

export const metadata: Metadata = {
  title: "Service Approval | FixMate",
};

export default function AdminServicesPage() {
  return <AdminServices />;
}
