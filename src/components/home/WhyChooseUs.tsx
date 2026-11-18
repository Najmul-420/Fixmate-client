import {
  BadgeCheck,
  Banknote,
  MapPin,
  ShieldCheck,
  Timer,
  Activity,
} from "lucide-react";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified Technicians",
    description:
      "Every technician is screened before their services are approved and published on the platform.",
  },
  {
    icon: Banknote,
    title: "Transparent Pricing",
    description:
      "See the base price before you request — no hidden charges, and the final amount is set only after the job.",
  },
  {
    icon: Activity,
    title: "Track Every Step",
    description:
      "Follow your repair live: requested, accepted, in-progress, completed — you always know where your job stands.",
  },
  {
    icon: Timer,
    title: "Fast Turnaround",
    description:
      "Choose home visits or shop drop-offs and pick a preferred date that fits your schedule.",
  },
  {
    icon: MapPin,
    title: "Local Experts",
    description:
      "Technicians work in your area, so help is always close by when your device breaks down.",
  },
  {
    icon: BadgeCheck,
    title: "Pay Only When Done",
    description:
      "Zero upfront cost — pay securely online only after the technician completes the repair.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#111827] text-gray-300 dark:bg-[#1F2937]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why Choose FixMate
          </h2>
          <p className="mt-2 text-gray-400">
            A repair experience built on trust, transparency and convenience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#059669]/20 text-[#34d399]">
                <point.icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold text-white">
                {point.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
