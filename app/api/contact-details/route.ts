import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessProfile } from "@/db/schema";

export async function GET() {
    try {
        const result = await db
            .select({
                phone: businessProfile.phone,
                email: businessProfile.email,
                mapEmbedUrl: businessProfile.mapEmbedUrl,
                shopName: businessProfile.shopName,
            })
            .from(businessProfile)
            .limit(1);

        const profile = result[0];

        if (!profile) {
            return NextResponse.json({
                phone: null,
                email: null,
                mapEmbedUrl: null,
                shopName: null,
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Contact details fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch contact details" },
            { status: 500 }
        );
    }
}