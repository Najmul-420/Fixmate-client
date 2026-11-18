import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import HowItWorks from "@/components/home/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works | FixMate",
  description:
    "From browsing approved services to paying after completion — see how a FixMate repair request moves through every stage.",
};

const guarantees = [
  "Only admin-approved services are bookable.",
  "Every status change is tracked from your dashboard.",
  "Technicians set the final price on completion.",
  "Cancel anytime while a request is still pending.",
];

export default function HowItWorksPage() {
  return (
    <div>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            How FixMate Works
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Repairing a device should be predictable. FixMate gives you a clear
            path from finding the right technician to paying for work you can
            actually see — with no upfront cost and no guesswork.
          </p>
        </div>
      </div>

      {/* Reuses the same 4-step flow shown on the home page. */}
      <HowItWorks />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              What you can count on
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {guarantees.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Find a Service
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
