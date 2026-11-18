import Link from "next/link";
import { PackageOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  /** Optional icon shown above the title (defaults to a package icon). */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Optional call-to-action link (or local-state button) below the text. */
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
};

/**
 * Reusable empty-state panel shown whenever a data list is empty
 * (no data yet, or nothing matched the current filters).
 */
export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background px-6 py-20 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="mt-1 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-1 inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
