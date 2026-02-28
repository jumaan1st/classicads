import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, customers, services } from "@/db/schema";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const filterYear = searchParams.get("year"); // e.g. "2024", "2025" or "all"

    let dateFilter = undefined;
    if (filterYear && filterYear !== "all") {
      const year = parseInt(filterYear);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = and(gte(invoices.issueDate, startOfYear), lte(invoices.issueDate, endOfYear));
    } else if (!filterYear) {
      // Default to current year
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = and(gte(invoices.issueDate, startOfYear), lte(invoices.issueDate, endOfYear));
    }

    // Execute all 5 separate queries in parallel
    const [
      revenueByMonth,
      servicePopularity,
      topCustomerOrdersRow,
      topCustomerRevenueRow,
      totalRevRow
    ] = await Promise.all([
      db
        .select({
          month: sql<string>`to_char(${invoices.issueDate}, 'YYYY-MM')`,
          revenue: sql<number>`sum(${invoices.total})`,
          invoices: sql<number>`count(${invoices.id})`,
        })
        .from(invoices)
        .where(dateFilter ? and(eq(invoices.isDeleted, false), dateFilter) : eq(invoices.isDeleted, false))
        .groupBy(sql`to_char(${invoices.issueDate}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${invoices.issueDate}, 'YYYY-MM')`),

      db
        .select({
          serviceName: invoiceItems.description,
          count: sql<number>`sum(${invoiceItems.quantity})`,
          revenue: sql<number>`sum(${invoiceItems.amount})`,
        })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(dateFilter ? and(eq(invoices.isDeleted, false), dateFilter) : eq(invoices.isDeleted, false))
        .groupBy(invoiceItems.description)
        .orderBy(
          desc(sql`sum(${invoiceItems.quantity})`),   // Primary sort
          desc(sql`sum(${invoiceItems.amount})`)      // Secondary sort
        )
        .limit(10),

      db
        .select({
          name: customers.name,
          count: sql<number>`count(${invoices.id})`,
        })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .where(dateFilter ? and(eq(invoices.isDeleted, false), dateFilter) : eq(invoices.isDeleted, false))
        .groupBy(customers.name)
        .orderBy(desc(sql`count(${invoices.id})`))
        .limit(1),

      db
        .select({
          name: customers.name,
          revenue: sql<number>`sum(${invoices.total})`,
        })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .where(dateFilter ? and(eq(invoices.isDeleted, false), dateFilter) : eq(invoices.isDeleted, false))
        .groupBy(customers.name)
        .orderBy(desc(sql`sum(${invoices.total})`))
        .limit(1),

      db
        .select({
          total: sql<number>`sum(${invoices.total})`,
        })
        .from(invoices)
        .where(dateFilter ? and(eq(invoices.isDeleted, false), dateFilter) : eq(invoices.isDeleted, false))
    ]);

    return NextResponse.json({
      revenueByMonth,
      servicePopularity,
      topCustomerOrders: topCustomerOrdersRow[0] || null,
      topCustomerRevenue: topCustomerRevenueRow[0] || null,
      totalRevenue: totalRevRow[0]?.total || 0,
      filterYear: filterYear || new Date().getFullYear().toString(),
    },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
