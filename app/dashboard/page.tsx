"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card"; // Adjust import path if needed
import { Users, TrendingUp, Trophy, Calendar, Filter, LayoutDashboard } from "lucide-react";

type RevenuePoint = { month: string; revenue: number; invoices: number };
type ServicePop = { serviceName: string; count: number; revenue: number };
type TopCustomer = { name: string; count?: number; revenue?: number } | null;

type Analytics = {
  revenueByMonth: RevenuePoint[];
  servicePopularity: ServicePop[];
  topCustomerOrders: TopCustomer;
  topCustomerRevenue: TopCustomer;
  totalRevenue: number;
  filterYear: string;
};

export default function DashboardOverview() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?year=${yearFilter}`)
      .then((r) => r.json())
      .then((analyticsRes) => {
        setData(analyticsRes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [yearFilter]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted-bg)]" />
          <div className="h-10 w-32 animate-pulse rounded-xl bg-[var(--muted-bg)]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-[var(--muted-bg)]" />
      </div>
    );
  }

  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => Number(m.revenue)), 1);
  const topService = data.servicePopularity[0] || null;

  const years = [
    new Date().getFullYear().toString(),
    (new Date().getFullYear() - 1).toString(),
    "all"
  ];

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <h1 className="font-heading text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Business Intelligence
          </h1>
          <p className="text-[var(--muted)] text-sm">Real-time performance metrics and revenue insights.</p>
        </div>

        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-1.5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-[var(--muted)] sm:hidden">Filter:</span>
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[var(--foreground)] outline-none border-none cursor-pointer pr-2"
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-[var(--card)]">{y === "all" ? "All Time" : `Year ${y}`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KEY METRICS CARDS */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* REVENUE CARD */}
        <Card className="relative overflow-hidden group p-6 bg-[var(--card)] border border-[var(--border)] transition-smooth hover:border-blue-500/30">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-4"> {/* Prevent text overflow */}
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-3xl font-heading font-black text-[var(--foreground)] tracking-tight truncate">
                ₹{Number(data.totalRevenue).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10" />
        </Card>

        {/* TOP CUSTOMER REVENUE */}
        <Card className="relative overflow-hidden group p-6 bg-[var(--card)] border border-[var(--border)] transition-smooth hover:border-amber-500/30">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-4 w-full"> {/* Allow truncation */}
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Top Customer (Value)</p>
              <p className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight truncate" title={data.topCustomerRevenue?.name || "N/A"}>
                {data.topCustomerRevenue?.name || "N/A"}
              </p>
              <p className="text-sm font-bold text-amber-500 mt-1">
                ₹{Number(data.topCustomerRevenue?.revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* TOP SERVICE */}
        <Card className="relative overflow-hidden group p-6 bg-[var(--card)] border border-[var(--border)] transition-smooth hover:border-emerald-500/30 md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-4 w-full"> {/* Allow truncation */}
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Best Seller</p>
              <p className="text-xl font-heading font-extrabold text-[var(--foreground)] tracking-tight truncate" title={topService?.serviceName || "N/A"}>
                {topService?.serviceName || "N/A"}
              </p>
              <p className="text-sm font-bold text-emerald-500 mt-1">
                {topService?.count || 0} Orders
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* REVENUE CHART */}
      <Card className="p-4 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
          <h2 className="font-heading text-xl font-bold text-[var(--foreground)]">Monthly Revenue Trend</h2>
          <div className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest self-start sm:self-auto">Growth Analytics</div>
        </div>
        <div className="flex items-end gap-2 sm:gap-4 lg:gap-6 h-64 sm:h-72 border-b border-[var(--border)] pb-2 overflow-x-auto w-full scrollbar-thin">
          {data.revenueByMonth.length > 0 ? (
            data.revenueByMonth.map((m) => {
              const heightPercent = maxRevenue ? (Number(m.revenue) / maxRevenue) * 100 : 0;
              return (
                <div key={m.month} className="group flex-1 min-w-[35px] sm:min-w-[40px] flex flex-col justify-end items-center h-full gap-2 relative pb-6">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black py-1 px-2 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-xl">
                    ₹{(Number(m.revenue) / 1000).toFixed(1)}k
                  </div>
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)]"
                    style={{ height: `${heightPercent}%`, minHeight: "6px" }}
                  />
                  <div className="absolute bottom-0 text-[9px] sm:text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter">
                    {new Date(m.month + "-01").toLocaleDateString(undefined, { month: 'short' })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full flex items-center justify-center text-[var(--muted)] italic h-full">No data for this period</div>
          )}
        </div>
      </Card>

      {/* CUSTOMER ENGAGEMENT SECTION */}
      <Card className="p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--foreground)] tracking-tight">Customer Engagement</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MOST RECURRING */}
          <div className="group relative p-5 sm:p-6 rounded-2xl bg-[var(--muted-bg)]/20 border border-[var(--border)] transition-smooth hover:border-emerald-500/40 hover:bg-[var(--muted-bg)]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Loyalty Tier</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                    Standard
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Most Recurring</p>
              <p className="text-lg sm:text-xl font-black text-[var(--foreground)] mb-6 truncate" title={data.topCustomerOrders?.name || "N/A"}>
                {data.topCustomerOrders?.name || "N/A"}
              </p>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-[var(--border)]/50">
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">{data.topCustomerOrders?.count || 0}</div>
              <div className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Invoices</div>
            </div>
          </div>

          {/* HIGHEST LIFETIME VALUE */}
          <div className="group relative p-5 sm:p-6 rounded-2xl bg-[var(--muted-bg)]/20 border border-[var(--border)] transition-smooth hover:border-amber-500/40 hover:bg-[var(--muted-bg)]/40 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">VIP Status</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
                    Top Contributor
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Highest Lifetime Value</p>
              <p className="text-lg sm:text-xl font-black text-[var(--foreground)] mb-6 truncate" title={data.topCustomerRevenue?.name || "N/A"}>
                {data.topCustomerRevenue?.name || "N/A"}
              </p>
            </div>

            <div className="flex items-end justify-between pt-4 border-t border-[var(--border)]/50">
              <div className="text-2xl sm:text-3xl font-black text-amber-500 truncate pr-2" title={`₹${Number(data.topCustomerRevenue?.revenue || 0).toLocaleString()}`}>
                ₹{Number(data.topCustomerRevenue?.revenue || 0).toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1 flex-shrink-0">Revenue</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SERVICE PERFORMANCE SECTION - Fixed Congestion */}
      <Card className="p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-xl font-bold text-[var(--foreground)] tracking-tight">Service Performance</h2>
          </div>
          <div className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest hidden sm:block">Revenue Contribution</div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {data.servicePopularity.length > 0 ? (
            data.servicePopularity.filter(s => s.serviceName && s.serviceName.length > 1).map((s) => (
              <div key={s.serviceName} className="flex flex-col gap-2 group w-full">

                {/* 1. Service Name (Full width, truncates) */}
                <span
                  className="block text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors w-full truncate"
                  title={s.serviceName}
                >
                  {s.serviceName}
                </span>

                {/* 2. Stats Row (Perfectly aligned vertically centered) */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-wider">
                    {s.count} {s.count === 1 ? 'Order' : 'Orders'}
                  </span>
                  <span className="block text-sm font-black text-blue-500">
                    ₹{Number(s.revenue).toLocaleString()}
                  </span>
                </div>

                {/* 3. Progress Bar */}
                <div className="h-2 w-full bg-[var(--muted-bg)]/40 rounded-full overflow-hidden shadow-inner border border-[var(--border)]/30 mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_10px_-2px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${(Number(s.revenue) / Number(data.totalRevenue || 1)) * 100}%` }}
                  />
                </div>

              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <p className="text-[var(--muted)] italic font-medium">No sales data available for this period</p>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}