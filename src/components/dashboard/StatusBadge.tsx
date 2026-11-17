import { bookingStatusStyles } from "@/lib/badges";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Colored status chip for a booking/job lifecycle value. */
export default function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        bookingStatusStyles[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {status}
    </span>
  );
}
