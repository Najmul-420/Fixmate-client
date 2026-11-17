import { Suspense } from "react";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

function NavbarFallback() {
  return <div className="sticky top-0 z-50 h-16 border-b bg-background" />;
}

/**
 * Layout for public routes (Home, Services, Service Details, About).
 * Navbar (streams in) + Footer; dashboards use their own shell instead.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
