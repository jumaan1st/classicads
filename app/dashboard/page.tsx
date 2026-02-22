"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  totalRevenueYTD: number;
  expensesThisMonth: number;
};

export default function DashboardOverview() {
  const [data, setData] = useState<{
    analytics: Analytics | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((analyticsRes) => {
        setData({
          analytics: analyticsRes,
        });
      });
  }, []);

  if (!data || !data.analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  const { analytics } = data;
  const maxRevenue = Math.max(...analytics.revenueByMonth.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Overview & Analytics
        </h1>
        <p className="text-[var(--muted)] text-sm">Welcome back. Monitor business performance and revenue metrics.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card className="relative p-6 sm:p-7 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
          <p className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Revenue (YTD)</p>
          <p className="text-3xl font-heading font-bold text-[var(--foreground)] tracking-tight">
            ₹{analytics.totalRevenueYTD.toLocaleString()}
          </p>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm">
        <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">
          Revenue by month
        </h2>
        <div className="mt-8 flex items-end gap-2 sm:gap-4 lg:gap-6 h-64">
          {analytics.revenueByMonth.map((m) => {
            const heightPercent = maxRevenue ? (m.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={m.month} className="group flex-1 flex flex-col justify-end items-center h-full gap-3 relative">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--foreground)] text-[var(--background)] text-xs font-bold py-1 px-2 rounded pointer-events-none">
                  ₹{(m.revenue / 1000).toFixed(0)}k
                </div>
                <div
                  className="w-full min-w-0 rounded-t-lg bg-gradient-to-t from-blue-600/60 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-500 ease-out"
                  style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                />
                <span className="text-[10px] sm:text-xs font-medium text-[var(--muted)] tracking-wider">
                  {m.month.slice(-2)}/{m.month.slice(2, 4)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:gap-6">
        <Card className="p-6 sm:p-8 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-sm flex flex-col">
          <h2 className="font-heading text-xl font-bold text-[var(--foreground)] mb-6">
            Service popularity
          </h2>
          <ul className="space-y-4 flex-1">
            {analytics.servicePopularity.map((s) => (
              <li key={s.serviceName} className="flex justify-between items-center text-sm border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                <span className="font-medium text-[var(--foreground)]">{s.serviceName}</span>
                <span className="text-[var(--muted)] font-medium">
                  <span className="text-[var(--foreground)] mr-1">{s.count}</span>
                  <span className="text-xs uppercase tracking-wider mx-2 opacity-50">SOLD</span>
                  <span className="font-bold text-blue-400">₹{s.revenue.toLocaleString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
