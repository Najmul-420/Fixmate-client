import { Suspense, type ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Layout for all dashboard routes: collapsible sidebar + topbar via the
 * client DashboardShell. No public Navbar/Footer here — the dashboard is
 * its own shell.
 *
 * Suspense is required: DashboardShell reads `usePathname()` and the auth
 * session, which are runtime values under Cache Components.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-muted/30" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
