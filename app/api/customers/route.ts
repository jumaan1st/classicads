import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get("query");
    const limitParam = searchParams.get("limit");

    const parsedLimit =
      limitParam !== null && !isNaN(Number(limitParam))
        ? Number(limitParam)
        : null;

    // Base condition
    const baseCondition = eq(customers.isDeleted, false);

    const searchCondition =
      queryParam && queryParam.trim().length > 0
        ? and(
          baseCondition,
          or(
            ilike(customers.name, `%${queryParam.trim()}%`),
            ilike(customers.email, `%${queryParam.trim()}%`),
            ilike(customers.phone, `%${queryParam.trim()}%`)
          )
        )
        : baseCondition;

    const baseQuery = db
      .select()
      .from(customers)
      .where(searchCondition)
      .orderBy(desc(customers.createdAt));

    const result =
      parsedLimit !== null
        ? await baseQuery.limit(parsedLimit)
        : await baseQuery;

    return NextResponse.json({ customers: result });

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
        address: body.address,
        notes: body.notes,
      })
      .returning();

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
    const { id, name, email, phone, gst } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updatePayload: any = {
      name,
      email: email || null,
      phone: phone || null,
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

    return NextResponse.json({ customer: updated[0] });

  } catch (error) {
    console.error("Customer PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}