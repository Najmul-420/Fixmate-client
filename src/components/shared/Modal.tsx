"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (e.g. "Confirm deletion"). */
  ariaLabel: string;
  children: ReactNode;
  size?: keyof typeof SIZES;
  /**
   * Blocks Escape / backdrop closing while a mutation is in flight, so the
   * user cannot dismiss the dialog mid-request.
   */
  locked?: boolean;
};

/**
 * Shared dialog shell: dark overlay (never pure black), Escape-to-close,
 * backdrop click, body scroll lock, and a short zoom/fade entrance.
 */
export default function Modal({
  open,
  onClose,
  ariaLabel,
  children,
  size = "md",
  locked = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !locked) onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, locked, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        // Only a click that starts on the backdrop closes the dialog.
        if (event.target === event.currentTarget && !locked) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-xl border bg-card p-6 shadow-xl",
          SIZES[size]
        )}
      >
        {children}
      </div>
    </div>
  );
}
