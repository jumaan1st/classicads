import { NextResponse } from "next/server";

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  invoices: number;
}

export interface ServicePopularity {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface Analytics {
  revenueByMonth: RevenueDataPoint[];
  servicePopularity: ServicePopularity[];
  conversionRate: number;
  totalLeads: number;
  wonLeads: number;
  totalRevenueYTD: number;
  expensesThisMonth: number;
}

const DUMMY_ANALYTICS: Analytics = {
  revenueByMonth: [
    { month: "2024-09", revenue: 185000, invoices: 4 },
    { month: "2024-10", revenue: 220000, invoices: 5 },
    { month: "2024-11", revenue: 310000, invoices: 6 },
    { month: "2024-12", revenue: 275000, invoices: 5 },
    { month: "2025-01", revenue: 195000, invoices: 3 },
    { month: "2025-02", revenue: 167470, invoices: 2 },
  ],
  servicePopularity: [
    { serviceId: "1", serviceName: "Living Room Design", count: 12, revenue: 480000 },
    { serviceId: "2", serviceName: "Kitchen Renovation", count: 6, revenue: 720000 },
    { serviceId: "4", serviceName: "Facade & Exterior Paint", count: 8, revenue: 520000 },
    { serviceId: "3", serviceName: "Bedroom Makeover", count: 10, revenue: 280000 },
    { serviceId: "6", serviceName: "Design Consultation", count: 18, revenue: 72000 },
  ],
  conversionRate: 32,
  totalLeads: 45,
  wonLeads: 14,
  totalRevenueYTD: 362470,
  expensesThisMonth: 42000,
};

export async function GET() {
  return NextResponse.json(DUMMY_ANALYTICS);
}
