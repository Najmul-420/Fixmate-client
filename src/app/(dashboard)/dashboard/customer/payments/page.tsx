import type { Metadata } from "next";
import PaymentHistory from "@/components/dashboard/PaymentHistory";

export const metadata: Metadata = {
  title: "Payment History | FixMate",
};

export default function CustomerPaymentsPage() {
  return <PaymentHistory />;
}
