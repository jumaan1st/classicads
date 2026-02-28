import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get("query");

    // Default to page 1, 10 items per page if not provided
    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "10";

    const page = Math.max(1, parseInt(pageParam) || 1);
    const limit = Math.max(1, parseInt(limitParam) || 10);
    const offset = (page - 1) * limit;

    // Base condition
    const baseCondition = eq(customers.isDeleted, false);

    const searchCondition =
      queryParam && queryParam.trim().length > 0
        ? and(
          baseCondition,
          or(
            ilike(customers.name, `%${queryParam.trim()}%`),
            ilike(customers.email, `%${queryParam.trim()}%`),
            ilike(customers.phone, `%${queryParam.trim()}%`),
            ilike(customers.gstNumber, `%${queryParam.trim()}%`)
          )
        )
        : baseCondition;

    // Execute data fetch and count simultaneously for performance
    const [data, totalResult] = await Promise.all([
      db
        .select()
        .from(customers)
        .where(searchCondition)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(searchCondition)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        customers: data,
        pagination: { total, pages, current: page }
      }
    );

  } catch (error) {
    console.error("Customer GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const inserted = await db
      .insert(customers)
      .values({
        name: body.name,
        email: body.email,
        phone: body.phone,
        gstNumber: body.gstNumber || body.gst, // Support both names for transition
        address: body.address,
        notes: body.notes,
      })
      .returning();

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return NextResponse.json(
      { customer: inserted[0] },
      { status: 201 }
    );

  } catch (error) {
    console.error("Customer POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, phone, gst, gstNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updatePayload: any = {
      name,
      email: email || null,
      phone: phone || null,
      gstNumber: gstNumber || gst || null,
      updatedAt: new Date(),
    };

    if (gst) {
      updatePayload.notes = `GST: ${gst}`;
    }

    const updated = await db
      .update(customers)
      .set(updatePayload)
      .where(eq(customers.id, id))
      .returning();

    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard");

    return NextResponse.json({ customer: updated[0] });

  } catch (error) {
    console.error("Customer PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}