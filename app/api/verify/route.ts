import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, customers, businessProfile } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });

    const invoice = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          projectTitle: invoices.projectTitle,
          issueDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          status: invoices.status,
          subtotal: invoices.subtotal,
          cgstPercent: invoices.cgstPercent,
          sgstPercent: invoices.sgstPercent,
          cgstAmount: invoices.cgstAmount,
          sgstAmount: invoices.sgstAmount,
          total: invoices.total,
          customerId: invoices.customerId,
          clientName: customers.name,
          clientEmail: customers.email,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(and(eq(invoices.id, id), eq(invoices.isDeleted, false)))
        .limit(1);

    if (!invoice.length) {
        return NextResponse.json({ error: "Invoice not found or deleted" }, { status: 404 });
    }

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    const profiles = await db.select().from(businessProfile).limit(1);
    const profile = profiles.length > 0 ? profiles[0] : null;

    return NextResponse.json({
        invoice: {
            ...invoice[0],
            currency: "INR",
            items,
        },
        profile
    });
  } catch (error) {
    console.error("Open API Verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
