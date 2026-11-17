import type { Metadata } from "next";
import AdminBookings from "@/components/dashboard/AdminBookings";

export const metadata: Metadata = {
  title: "All Bookings | FixMate",
};

export default function AdminBookingsPage() {
  return <AdminBookings />;
}
