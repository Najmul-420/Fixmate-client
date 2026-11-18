"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  authClient,
  getDashboardPath,
  type FixMateUser,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const inputClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only allow same-app relative redirect targets.
  const redirectTarget = searchParams.get("redirect");
  const safeRedirect =
    redirectTarget && redirectTarget.startsWith("/") ? redirectTarget : null;

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      next.email = "Please enter a valid email address.";
    }
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(
          error.message ?? "Invalid email or password. Please try again."
        );
        return;
      }
      const role = (data?.user as FixMateUser | undefined)?.role ?? null;
      toast.success("Signed in! Welcome back.");
      router.push(safeRedirect ?? getDashboardPath(role));
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your repairs and services.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearError("email");
            }}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={cn(inputClasses, errors.email && "border-destructive")}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError("password");
              }}
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              className={cn(inputClasses, "pr-10", errors.password && "border-destructive")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to FixMate?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
