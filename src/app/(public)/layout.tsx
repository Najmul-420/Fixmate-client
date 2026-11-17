import type { ReactNode } from "react";
import Footer from "@/components/shared/Footer";

/**
 * Layout for public routes (Home, Services, Service Details, About, Auth).
 * The Navbar stays global (root layout) so it is also available on the
 * protected dashboard routes; the Footer is public-only.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
