import { CreditCard, Search, Send, Wrench } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find a Service",
    description:
      "Browse approved repair services by category, service mode and price, then pick the technician that fits your need.",
  },
  {
    icon: Send,
    title: "Send a Request",
    description:
      "Describe the problem, choose a preferred date and share your address — your request goes straight to the technician.",
  },
  {
    icon: Wrench,
    title: "Technician Fixes It",
    description:
      "The technician accepts your request and repairs your device at home or in the shop, with every status step tracked.",
  },
  {
    icon: CreditCard,
    title: "Pay After Completion",
    description:
      "Review the final billing amount once the job is done and pay securely online — you only pay when the work is complete.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How FixMate Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            From broken to fixed in four simple steps — transparent at every
            stage.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line (desktop) */}
          <span
            aria-hidden="true"
            className="absolute inset-x-16 top-8 hidden border-t-2 border-dashed lg:block"
          />

          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center gap-4 text-center">
              <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
                <step.icon className="size-7 text-foreground" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
