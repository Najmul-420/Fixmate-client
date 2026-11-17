import type { Metadata } from "next";
import CustomerBookings from "@/components/dashboard/CustomerBookings";

export const metadata: Metadata = {
  title: "My Bookings | FixMate",
};

export default function CustomerBookingsPage() {
  return <CustomerBookings />;
}
