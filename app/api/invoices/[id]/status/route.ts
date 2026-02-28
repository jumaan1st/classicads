import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/lib/db-session";
import { revalidatePath } from "next/cache";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        const { status } = await req.json();
        if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

        await db
            .update(invoices)
            .set({ status, updatedAt: new Date() })
            .where(eq(invoices.id, id));

        revalidatePath("/dashboard/invoices");
        revalidatePath(`/dashboard/invoices/${id}`);

        return NextResponse.json({ success: true, status });
    } catch (err) {
        console.error("Status update error:", err);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
