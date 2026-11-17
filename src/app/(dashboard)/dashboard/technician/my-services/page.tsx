import type { Metadata } from "next";
import MyServices from "@/components/dashboard/MyServices";

export const metadata: Metadata = {
  title: "My Services | FixMate",
};

export default function MyServicesPage() {
  return <MyServices />;
}
