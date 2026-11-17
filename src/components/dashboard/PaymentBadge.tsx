import { paymentStatusStyles } from "@/lib/badges";
import { cn } from "@/lib/utils";

/** Colored payment-status chip ("Paid" green / "Unpaid" amber). */
export default function PaymentBadge({
  status,
  className,
}: {
  status: "paid" | "unpaid" | undefined;
  className?: string;
}) {
  const normalized = status ?? "unpaid";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        paymentStatusStyles[normalized],
        className
      )}
    >
      {normalized}
    </span>
  );
}
