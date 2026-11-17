"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarClock,
  ClipboardList,
  Coins,
  FolderOpen,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Receipt,
  ShieldCheck,
  UserCircle,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession, type FixMateUser, type UserRole } from "@/lib/auth-client";
import { roleBadgeStyles, roleLabel } from "@/lib/badges";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: typeof House };

/** Per-role sidebar sections (links to pages not built yet are fine — they 404). */
const navByRole: Record<UserRole, NavItem[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Bookings", href: "/dashboard/customer/bookings", icon: CalendarClock },
    { label: "Payment History", href: "/dashboard/customer/payments", icon: Receipt },
  ],
  technician: [
    { label: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
    { label: "Add Service", href: "/dashboard/technician/add-service", icon: PlusCircle },
    { label: "My Services", href: "/dashboard/technician/services", icon: FolderOpen },
    { label: "Manage Requests", href: "/dashboard/technician/requests", icon: ClipboardList },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Service Approval", href: "/dashboard/admin/services", icon: ShieldCheck },
    { label: "All Bookings", href: "/dashboard/admin/bookings", icon: ClipboardList },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: Coins },
  ],
};

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/**
 * Shared dashboard chrome: collapsible sidebar + topbar (avatar, name, role
 * badge, link back to the public site, sign out). No public footer.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as FixMateUser | undefined;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The sidebar section is derived from the URL segment so each dashboard
  // shows its own nav, independent of session loading state.
  const segment = pathname.split("/")[2] as UserRole | undefined;
  const role: UserRole =
    segment === "technician" || segment === "admin" ? segment : "customer";
  const navItems = navByRole[role];

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out. See you soon!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Could not sign you out. Please try again.");
    }
  };

  const sidebarBody = (collapsedMode: boolean) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href="/"
        className={cn(
          "flex h-16 items-center gap-2.5 border-b px-5",
          collapsedMode && "justify-center px-2"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench className="size-4" />
        </span>
        {!collapsedMode && (
          <span className="text-lg font-bold tracking-tight">FixMate</span>
        )}
      </Link>

      {/* Role nav */}
      <nav
        aria-label="Dashboard"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            collapsed={collapsedMode}
            onNavigate={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Shared bottom links */}
      <div className="flex flex-col gap-1 border-t p-3">
        <NavLink
          item={{ label: "Profile", href: "/dashboard/profile", icon: UserCircle }}
          active={pathname.startsWith("/dashboard/profile")}
          collapsed={collapsedMode}
          onNavigate={() => setMobileOpen(false)}
        />
        <NavLink
          item={{ label: "Back to Home", href: "/", icon: House }}
          active={false}
          collapsed={collapsedMode}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 border-r bg-background transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarBody(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r bg-background shadow-xl">
            {sidebarBody(false)}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="absolute left-64 top-4 ml-2 rounded-lg bg-background p-2 text-muted-foreground shadow-md transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>

          <p className="hidden truncate text-sm font-medium text-muted-foreground sm:block">
            Dashboard
          </p>

          <div className="ml-auto flex items-center gap-3">
            {/* Avatar + name + role badge */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={32}
                  height={32}
                  className="size-8 rounded-full border object-cover"
                />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(user?.name)}
                </span>
              )}
              <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                <span className="max-w-40 truncate text-sm font-semibold">
                  {isPending ? "Loading…" : (user?.name ?? "User")}
                </span>
                {!isPending && user?.role && (
                  <span
                    className={cn(
                      "w-fit rounded-full px-1.5 text-[10px] font-semibold uppercase tracking-wide",
                      roleBadgeStyles[user.role]
                    )}
                  >
                    {roleLabel(user.role)}
                  </span>
                )}
              </span>
            </Link>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
