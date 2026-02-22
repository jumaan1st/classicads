"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Database, Briefcase, FileText, Users, UserSquare, BarChart, Settings } from "lucide-react";

type Role = "employee" | "admin";

const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/customers", label: "Customers", icon: UserSquare },
];

const employeeLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
];

export default function DashboardSidebar({
  role,
  isOpen,
  setIsOpen
}: {
  role: Role;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col border-r border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="text-xl font-heading font-bold text-[var(--foreground)] tracking-tight">
            Classic<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ads</span>
            <span className="block text-[10px] text-[var(--muted)] font-medium uppercase tracking-widest mt-0.5">{role} Panel</span>
          </Link>
          <button
            className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
          <div className="px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]/70">
            Menu
          </div>
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${isActive
                  ? "bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/5 border border-blue-500/20"
                  : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)] hover:border-[var(--border)] border border-transparent"
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted-bg)]/30">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all"
          >
            ← Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
}
