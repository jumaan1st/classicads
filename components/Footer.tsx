"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/login")) return null;
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--section)]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <p className="font-heading text-xl font-bold text-[var(--foreground)]">
              Classic<span className="text-[var(--muted)]">Ads</span>
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">
              Interior & Exterior Design — Transform your space with precision and elegance.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[15px] font-medium text-[var(--muted)] transition-colors hover-accent"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <p className="text-[14px] text-[var(--muted)]">© {new Date().getFullYear()} ClassicAds. All rights reserved.</p>
          <div className="flex justify-center sm:justify-start gap-6 text-[14px] text-[var(--muted)]">
            <Link href="/contact" className="hover-accent text-[var(--muted)]">
              Contact (WhatsApp)
            </Link>
            <a href="mailto:hello@classicads.com" className="hover-accent text-[var(--muted)]">
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
