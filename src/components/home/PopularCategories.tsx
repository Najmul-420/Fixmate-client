import Link from "next/link";
import {
  ArrowUpRight,
  Laptop,
  Smartphone,
  Snowflake,
  Tv,
  WashingMachine,
  Zap,
  Refrigerator,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/types";

const categories: { name: ServiceCategory; icon: typeof Smartphone }[] = [
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop & PC", icon: Laptop },
  { name: "AC", icon: Snowflake },
  { name: "Refrigerator", icon: Refrigerator },
  { name: "TV", icon: Tv },
  { name: "Washing Machine", icon: WashingMachine },
  { name: "Electrical", icon: Zap },
];

export default function PopularCategories() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Popular Categories
          </h2>
          <p className="mt-2 text-muted-foreground">
            Whatever is broken, we have a verified technician for it.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-background p-6 text-center transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <category.icon className="size-6" />
              </span>
              <span className="text-sm font-semibold">{category.name}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                Explore services
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
