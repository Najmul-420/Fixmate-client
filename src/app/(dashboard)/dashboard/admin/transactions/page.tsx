import type { Metadata } from "next";
import AdminTransactions from "@/components/dashboard/AdminTransactions";

export const metadata: Metadata = {
  title: "Transactions | FixMate",
};

export default function AdminTransactionsPage() {
  return <AdminTransactions />;
}
