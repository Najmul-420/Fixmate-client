import { Suspense } from "react";
import Navbar from "@/components/shared/Navbar";

function NavbarFallback() {
  return <div className="sticky top-0 z-50 h-16 border-b bg-background" />;
}

/**
 * Layout for auth routes (sign-in, sign-up): navbar + centered content,
 * no footer. Dashboards use their own shell instead.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1 bg-muted/30">{children}</main>
    </>
  );
}
