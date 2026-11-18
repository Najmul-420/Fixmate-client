"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { useSession, type FixMateUser } from "@/lib/auth-client";
import ProfileForm from "@/components/dashboard/ProfileForm";

/**
 * Shared profile page body. The form is keyed by user id so its initial
 * values are taken from the session exactly once, then never overwritten
 * by an incidental session re-render.
 */
export default function ProfileView() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const user = session?.user as FixMateUser | undefined;

  if (isPending) {
    return (
      <div className="flex items-center gap-3 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="size-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">
          Sign in to view your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your profile settings are linked to your FixMate account.
        </p>
        <Link
          href="/sign-in"
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogIn className="size-4" />
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaved = () => {
    void refetch();
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal details — the changes appear across the platform
          and in the navbar immediately.
        </p>
      </div>

      <ProfileForm key={user.id} user={user} onSaved={handleSaved} />
    </div>
  );
}
