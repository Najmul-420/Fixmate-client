import type { ReactNode } from "react";

/**
 * Layout for auth routes (sign-in, sign-up): centered content, no footer.
 * The global Navbar (root layout) stays visible for navigation.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="bg-muted/30">{children}</div>;
}
