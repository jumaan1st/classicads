import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceItems, customers } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    // ================================
    // 🔍 SINGLE INVOICE FETCH
    // ================================
    if (id) {
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
        .where(
          and(
            eq(invoices.id, id),
            eq(invoices.isDeleted, false)
          )
        )
        .limit(1);

      if (!invoice.length) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id));

      return NextResponse.json({
        ...invoice[0],
        currency: "INR",
        items,
      });
    }

    // ================================
    // 📋 LIST FETCH & PAGINATION
    // ================================
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const offset = (page - 1) * limit;

    const filterConditions = [eq(invoices.isDeleted, false)];
    if (status) filterConditions.push(eq(invoices.status, status as any));
    const finalCondition = and(...filterConditions);

    const [data, totalResult] = await Promise.all([
      db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          projectTitle: invoices.projectTitle,
          issueDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          status: invoices.status,
          total: invoices.total,
          clientName: customers.name,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(finalCondition)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(finalCondition)
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // Fetch items for each invoice (optimized)
    const invoiceIds = data.map(i => i.id);

    let itemsMap: Record<string, any[]> = {};

    if (invoiceIds.length > 0) {
      const items = await db
        .select()
        .from(invoiceItems)
        .where(inArray(invoiceItems.invoiceId, invoiceIds));

      items.forEach(item => {
        if (!itemsMap[item.invoiceId]) itemsMap[item.invoiceId] = [];
        itemsMap[item.invoiceId].push(item);
      });
    }

    const formatted = data.map(inv => ({
      ...inv,
      currency: "INR",
      items: itemsMap[inv.id] || [],
    }));

    return NextResponse.json({
      invoices: formatted,
      pagination: { total, pages: Math.ceil(total / limit), current: page }
    });

  } catch (error) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // ── Required fields validation ────────────────────────────────
    const requiredFields = [
      "customerId",
      "issueDate",
      "dueDate",
      "subtotal",
      "cgstPercent",
      "sgstPercent",
      "cgstAmount",
      "sgstAmount",
      "total",
      "items",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const {
      customerId,
      projectTitle = null,
      projectDescription = null,
      issueDate,
      dueDate,
      cgstPercent,
      sgstPercent,
      subtotal,
      cgstAmount,
      sgstAmount,
      total,
      status = "draft",
      notes = null,
      items, // array of { description, quantity, unitPrice, amount, type, serviceId? }
    } = body;

    // Validate customer exists
    const customerExists = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.isDeleted, false)))
      .limit(1);

    if (customerExists.length === 0) {
      return NextResponse.json(
        { error: "Customer not found or has been deleted" },
        { status: 404 }
      );
    }

    // ── Generate invoice number (year + random 4-digit) ───────────
    const year = new Date().getFullYear();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${year}-${randomPart}`;

    let finalInvoiceNumber = invoiceNumber;
    // Check for collision (very rare, but good practice)
    const existing = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);

    if (existing.length > 0) {
      // fallback - add timestamp milliseconds
      finalInvoiceNumber = `INV-${year}-${randomPart}-${Date.now().toString().slice(-4)}`;
    }

    // ── Transaction: create invoice + items ───────────────────────
    const result = await db.transaction(async (tx) => {
      // 1. Insert invoice
      const [newInvoice] = await tx.insert(invoices).values({
        invoiceNumber: finalInvoiceNumber,
        customerId,
        projectTitle,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subtotal,
        cgstPercent,
        sgstPercent,
        cgstAmount,
        sgstAmount,
        total,
        status,
        createdAt: sql`now()`,
      })
        .returning({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          customerId: invoices.customerId,
          status: invoices.status,
          issueDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          total: invoices.total,
        });

      // 2. Insert all line items
      if (items?.length > 0) {
        await tx.insert(invoiceItems).values(
          items.map((item: any) => ({
            invoiceId: newInvoice.id,
            serviceId: item.serviceId || null,
            description: item.description?.trim() || "Unnamed item",
            quantity: Number(item.quantity) || 1,
            unitPrice: item.unitPrice?.toString() || "0",
            amount: item.amount?.toString() || "0",
            type: item.type || "miscellaneous",
            createdAt: sql`NOW()`,
          }))
        );
      }

      return newInvoice;
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        success: true,
        invoice: {
          ...result,
          currency: "INR",
          // optionally fetch customer name here if you want full response
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/invoices] Error:", error);

    if (error?.code === "23505") { // unique violation (e.g. invoiceNumber)
      return NextResponse.json(
        { error: "Invoice number collision. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice", details: error?.message },
      { status: 500 }
    );
  }
}