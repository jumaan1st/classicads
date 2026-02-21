"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type RevenuePoint = { month: string; revenue: number; invoices: number };
type ServicePop = { serviceName: string; count: number; revenue: number };
type Perf = { name: string; projectsCompleted: number; revenue: number };

type Analytics = {
  revenueByMonth: RevenuePoint[];
  servicePopularity: ServicePop[];
  conversionRate: number;
  totalLeads: number;
  wonLeads: number;
  employeePerformance: Perf[];
  totalRevenueYTD: number;
  expensesThisMonth: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Analytics
      </h1>
      <p className="mt-1 text-[var(--muted)]">Data from /api/analytics</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-[var(--muted)]">Revenue (YTD)</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--accent)]">
            ₹{data.totalRevenueYTD.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-[var(--muted)]">Conversion rate</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.conversionRate}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-[var(--muted)]">Leads won</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {data.wonLeads} / {data.totalLeads}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-[var(--muted)]">Expenses (this month)</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--muted)]">
            ₹{data.expensesThisMonth.toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
          Revenue by month
        </h2>
        <div className="mt-4 flex items-end gap-2">
          {data.revenueByMonth.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full min-w-0 rounded-t bg-[var(--accent)]/30 transition-all"
                style={{ height: `${(m.revenue / maxRevenue) * 120}px`, minHeight: "4px" }}
              />
              <span className="text-xs text-[var(--muted)]">
                {m.month.slice(-2)}/{m.month.slice(2, 4)}
              </span>
              <span className="text-xs font-medium text-[var(--muted)]">
                ₹{(m.revenue / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Service popularity
          </h2>
          <ul className="mt-4 space-y-3">
            {data.servicePopularity.map((s) => (
              <li key={s.serviceName} className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{s.serviceName}</span>
                <span className="text-[var(--accent)]">
                  {s.count} · ₹{s.revenue.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Employee performance
          </h2>
          <ul className="mt-4 space-y-3">
            {data.employeePerformance.map((e) => (
              <li key={e.name} className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">{e.name}</span>
                <span className="text-[var(--foreground)]">
                  {e.projectsCompleted} projects · ₹{e.revenue.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
