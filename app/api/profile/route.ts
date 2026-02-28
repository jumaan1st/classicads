import { NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfile } from '@/db/schema';
import { getSession } from '@/app/lib/db-session';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await db
            .select()
            .from(businessProfile)
            .limit(1);

        return NextResponse.json({
            profile: result[0] ?? null,
        });

    } catch (error: any) {
        console.error('Fetch profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Explicit field mapping (safer than spreading payload)
        const updateData = {
            ownerName: body.ownerName ?? null,
            shopName: body.shopName ?? null,
            profileImage: body.profileImage ?? null,
            signatureImage: body.signatureImage ?? null,
            upiId: body.upiId ?? null,
            gstNumber: body.gstNumber ?? null,
            phone: body.phone ?? null,
            email: body.email ?? null,
            address: body.address ?? null,
            googleMapsLocation: body.googleMapsLocation ?? null,
            mapEmbedUrl: body.mapEmbedUrl?.trim() ?? null,
            startedBusinessAt: body.startedBusinessAt
                ? new Date(body.startedBusinessAt)
                : null,
            updatedAt: new Date(),
        };

        const existingProfiles = await db
            .select({ id: businessProfile.id })
            .from(businessProfile)
            .limit(1);

        let savedProfile;

        if (existingProfiles.length > 0) {
            // Update singleton row
            const [updated] = await db
                .update(businessProfile)
                .set(updateData)
                .where(eq(businessProfile.id, existingProfiles[0].id))
                .returning();

            savedProfile = updated;
        } else {
            // Insert first row
            const [inserted] = await db
                .insert(businessProfile)
                .values(updateData)
                .returning();

            savedProfile = inserted;
        }

        return NextResponse.json({
            success: true,
            profile: savedProfile,
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}