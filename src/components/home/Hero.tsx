import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Laptop,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";

const heroHighlights = [
  "Verified technicians only",
  "Pay after service completion",
  "Track every repair step",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/60 to-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-[#059669]" />
            Trusted repair service platform
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Broken Device?{" "}
            <span className="text-muted-foreground">Get It Fixed by</span>{" "}
            Verified Technicians
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            FixMate connects you with skilled, background-checked technicians
            for smartphones, laptops, ACs, refrigerators and more — book in
            minutes and only pay once the job is done.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/services"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Browse Services
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-lg border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted"
            >
              How It Works
            </Link>
          </div>

          <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
            {heroHighlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-4 text-[#059669]" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Illustration */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br from-[#111827] via-[#065f46] to-[#059669]">
            <Wrench className="size-40 text-white/90 sm:size-52" strokeWidth={1.25} />

            {/* Floating accent cards */}
            <div className="absolute left-4 top-8 flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur sm:left-8">
              <Smartphone className="size-5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-zinc-900">Smartphone</p>
                <p className="text-[10px] text-zinc-500">Screen &amp; battery</p>
              </div>
            </div>

            <div className="absolute right-4 top-1/3 flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur sm:right-8">
              <Laptop className="size-5 text-violet-600" />
              <div>
                <p className="text-xs font-semibold text-zinc-900">Laptop &amp; PC</p>
                <p className="text-[10px] text-zinc-500">OS &amp; hardware</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
              <ShieldCheck className="size-5 text-emerald-600" />
              <p className="text-xs font-semibold text-zinc-900">
                100% Verified Experts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
