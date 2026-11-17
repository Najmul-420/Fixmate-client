import Link from "next/link";
import { Mail, MapPin, Phone, Wrench } from "lucide-react";
import CopyrightYear from "./CopyrightYear";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Sign Up", href: "/sign-up" },
];

const categories = [
  { label: "Smartphone", href: "/services?category=Smartphone" },
  { label: "Laptop & PC", href: "/services?category=Laptop%20%26%20PC" },
  { label: "AC", href: "/services?category=AC" },
  { label: "Refrigerator", href: "/services?category=Refrigerator" },
  { label: "TV", href: "/services?category=TV" },
  { label: "Washing Machine", href: "/services?category=Washing%20Machine" },
  { label: "Electrical", href: "/services?category=Electrical" },
];

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#059669] text-white">
                <Wrench className="size-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-gray-400">
                Fix<span className="text-[#34d399]">Mate</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Your trusted partner for smart device and home appliance repairs.
              Verified technicians, transparent pricing, and pay-after-service
              convenience.
            </p>
            <a
              href="https://x.com/fixmate"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="FixMate on X (Twitter)"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-[#059669] hover:text-white"
            >
              <XLogo className="size-4" />
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.label}>
                  <Link
                    href={category.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">
                  support@fixmate.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">
                  Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="text-xs text-gray-500">
            <CopyrightYear />
          </p>
          <p className="text-xs text-gray-500">
            Reliable repairs, on demand.
          </p>
        </div>
      </div>
    </footer>
  );
}
