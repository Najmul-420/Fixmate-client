"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { fetchUsers, updateUserRole } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import type { UserRole } from "@/lib/auth-client";
import { roleBadgeStyles, roleLabel } from "@/lib/badges";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/shared/EmptyState";

const ROLES: UserRole[] = ["customer", "technician", "admin"];

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

/**
 * Admin "Manage Users": every platform user with an inline role changer.
 * Changing a role PATCHes the user record and refreshes the list.
 */
export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const list = await fetchUsers();
    setUsers(
      [...list].sort((a, b) =>
        (a.name ?? a.email).localeCompare(b.name ?? b.email)
      )
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchUsers().then((list) => {
      if (cancelled) return;
      setUsers(
        [...list].sort((a, b) =>
          (a.name ?? a.email).localeCompare(b.name ?? b.email)
        )
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoleChange = async (user: AdminUser, role: UserRole) => {
    if (!role || role === user.role) return;
    setBusyId(user._id);
    const ok = await updateUserRole(user._id, role);
    setBusyId(null);
    if (ok) {
      toast.success(
        `${user.name ?? user.email} is now ${roleLabel(role).toLowerCase()}.`
      );
      loadUsers();
    } else {
      toast.error("Could not change the role. Please try again.");
    }
  };

  if (users === null) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading users…
      </div>
    );
  }

  const countByRole = (role: UserRole) =>
    users.filter((user) => user.role === role).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All platform accounts. Changing a role takes effect on the
            user&apos;s next session.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {countByRole("customer")} customers · {countByRole("technician")}{" "}
          technicians · {countByRole("admin")} admins
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="As people sign up, their accounts will appear here for role management."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name ?? "User"}
                            className="size-8 rounded-full border object-cover"
                          />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {getInitials(user.name)}
                          </span>
                        )}
                        <span className="max-w-40 truncate font-semibold">
                          {user.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-52 truncate px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                            roleBadgeStyles[user.role]
                          )}
                        >
                          {roleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <select
                          value={user.role ?? ""}
                          onChange={(event) =>
                            handleRoleChange(user, event.target.value as UserRole)
                          }
                          disabled={busyId === user._id}
                          aria-label={`Change role for ${user.name ?? user.email}`}
                          className="h-9 rounded-lg border bg-background px-2 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none disabled:opacity-60"
                        >
                          {!user.role && <option value="">Unknown</option>}
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {roleLabel(role)}
                            </option>
                          ))}
                        </select>
                        {busyId === user._id && (
                          <Loader2 className="ml-2 size-4 self-center animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <li key={user._id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? "User"}
                      className="size-9 rounded-full border object-cover"
                    />
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {getInitials(user.name)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{user.name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  {user.role && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                        roleBadgeStyles[user.role]
                      )}
                    >
                      {roleLabel(user.role)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <select
                    value={user.role ?? ""}
                    onChange={(event) =>
                      handleRoleChange(user, event.target.value as UserRole)
                    }
                    disabled={busyId === user._id}
                    aria-label={`Change role for ${user.name ?? user.email}`}
                    className="h-9 flex-1 rounded-lg border bg-background px-2 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none disabled:opacity-60"
                  >
                    {!user.role && <option value="">Unknown</option>}
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
