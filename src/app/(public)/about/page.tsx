import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | FixMate",
  description:
    "FixMate connects customers with verified technicians for transparent, trackable device and appliance repairs — and you only pay after the job is done.",
};

const principles = [
  {
    icon: BadgeCheck,
    title: "Verified Technicians",
    description:
      "Every service is submitted by a technician and reviewed by an admin before customers can book it.",
  },
  {
    icon: CreditCard,
    title: "Pay After Service",
    description:
      "No upfront payment. The technician sets a final amount on completion and you pay securely through Stripe.",
  },
  {
    icon: CalendarClock,
    title: "Fully Trackable",
    description:
      "Follow your request from requested → accepted → in progress → completed, with every status visible in your dashboard.",
  },
];

const guidelines = [
  {
    title: "For Customers",
    points: [
      "Browse only approved and available services.",
      "Describe the problem clearly (at least 20 characters) and pick a preferred date.",
      "You can cancel a request while it is still pending.",
      "Pay only after the technician completes the job and sets the final amount.",
    ],
  },
  {
    title: "For Technicians",
    points: [
      "Publish services with clear pricing, service mode and service area.",
      "Approve or reject incoming requests, then move jobs through the pipeline.",
      "Set a final billing amount (greater than zero) when marking a job complete.",
      "Keep availability accurate so customers only see services you can take.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          About FixMate
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Repairs without the guesswork
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          FixMate is a repair-service platform for smart devices and home
          appliances. It connects customers with verified technicians through a
          transparent, trackable workflow — with a simple promise: you only pay
          once the work is complete.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/services"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Wrench className="size-4" />
            Browse Services
          </Link>
          <Link
            href="/#how-it-works"
            className="inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Principles */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">
          What makes us different
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Guidelines */}
      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">
          Platform guidelines
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Clear rules of engagement keep every repair fair for both sides.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {guidelines.map((group) => (
            <div
              key={group.title}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4.5 text-primary" />
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {group.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
