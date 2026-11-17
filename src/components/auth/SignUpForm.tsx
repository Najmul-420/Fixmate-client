"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, Loader2, User, Wrench } from "lucide-react";
import { toast } from "sonner";
import { authClient, getDashboardPath, type UserRole } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const roleOptions: {
  value: Exclude<UserRole, "admin">;
  label: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    value: "customer",
    label: "Customer",
    description: "I need my device repaired",
    icon: User,
  },
  {
    value: "technician",
    label: "Technician",
    description: "I offer repair services",
    icon: Wrench,
  },
];

const passwordRules = [
  { label: "At least 6 characters", test: (value: string) => value.length >= 6 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
];

const inputClasses =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none";

export default function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    const failedRule = passwordRules.find((rule) => !rule.test(password));
    if (failedRule) {
      next.password = `Password must contain ${failedRule.label.toLowerCase()}.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // NOTE: the BetterAuth server must declare `role` under
      // `user.additionalFields` for this field to be persisted.
      const { error } = await authClient.$fetch("/sign-up/email", {
        body: { name: name.trim(), email: email.trim(), password, role },
      });
      if (error) {
        toast.error(error.message ?? "Could not create your account. Please try again.");
        return;
      }
      toast.success("Account created! Welcome to FixMate.");
      router.push(getDashboardPath(role));
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
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join FixMate as a customer or a verified technician.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {/* Role selection (radio cards) */}
        <div role="radiogroup" aria-label="Account role" className="grid grid-cols-2 gap-3">
          {roleOptions.map((option) => {
            const selected = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRole(option.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <option.icon className="size-4" />
                </span>
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Full Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            className={cn(inputClasses, errors.name && "border-destructive")}
          />
          {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
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
          {/* Live password checklist */}
          <ul className="mt-1 flex flex-col gap-1">
            {passwordRules.map((rule) => {
              const passed = password.length > 0 && rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    passed ? "text-[#059669]" : "text-muted-foreground"
                  )}
                >
                  <Check className={cn("size-3", !passed && "opacity-30")} />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
