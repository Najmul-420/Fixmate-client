import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  /** Icon rendered in a tinted badge (pass a lucide icon component). */
  icon: LucideIcon;
  label: string;
  value: string | number;
  /**
   * Tailwind classes for the icon badge tint, e.g.
   * "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]".
   */
  iconClassName?: string;
  className?: string;
};

/**
 * Reusable dashboard statistics card. Server-safe (no hooks), so it can be
 * used from server or client components alike.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-ring/40",
        className
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
          iconClassName
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold tabular-nums tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
