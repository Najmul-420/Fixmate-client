import type { Metadata } from "next";
import AddServiceForm from "@/components/dashboard/AddServiceForm";

export const metadata: Metadata = {
  title: "Add Service | FixMate",
};

export default function AddServicePage() {
  return <AddServiceForm />;
}
