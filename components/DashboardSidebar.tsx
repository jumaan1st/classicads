"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "employee" | "admin";

const adminLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "CRM / Leads" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/pages", label: "Page content" },
];

const employeeLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/projects", label: "My Projects" },
  { href: "/dashboard/invoices", label: "Invoices" },
];

export default function DashboardSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--muted-bg)]/30 p-4">
      <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
        Classic<span className="text-[var(--accent)]">Ads</span>
      </Link>
      <p className="mt-1 text-xs text-[var(--muted)] capitalize">{role} dashboard</p>
      <nav className="mt-6 flex flex-col gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-smooth ${
              pathname === href
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="mt-8 block text-sm text-[var(--muted)] hover:text-[var(--accent)]">
        ← Back to site
      </Link>
    </aside>
  );
}
