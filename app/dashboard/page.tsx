"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";

export default function DashboardOverview() {
  const [stats, setStats] = useState<{
    leads: number;
    projects: number;
    invoices: number;
    revenue: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()),
    ]).then(([leadsRes, projectsRes, invoicesRes, analyticsRes]) => {
      setStats({
        leads: leadsRes.leads?.length ?? 0,
        projects: projectsRes.projects?.length ?? 0,
        invoices: invoicesRes.invoices?.length ?? 0,
        revenue: analyticsRes.totalRevenueYTD ?? 0,
      });
    });
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
        ))}
      </div>
    );
  }

  const tiles = [
    { label: "Total leads", value: stats.leads, href: "/dashboard/leads" },
    { label: "Active projects", value: stats.projects, href: "/dashboard/projects" },
    { label: "Invoices", value: stats.invoices, href: "/dashboard/invoices" },
    {
      label: "Revenue (YTD)",
      value: `₹${stats.revenue.toLocaleString()}`,
      href: "/dashboard/analytics",
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Overview
      </h1>
      <p className="mt-1 text-[var(--muted)]">Summary from API dummy data.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, href }) => (
          <Link key={href} href={href}>
            <Card className="p-6 transition-smooth hover:border-[var(--accent)]/30">
              <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
