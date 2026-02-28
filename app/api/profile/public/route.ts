import { NextResponse } from 'next/server';
import { db } from '@/db';
import { businessProfile } from '@/db/schema';

// Public endpoint — no auth required. Only exposes safe, display-only fields.
export async function GET() {
    try {
        const profiles = await db.select().from(businessProfile).limit(1);
        if (!profiles.length) return NextResponse.json({ profile: null });

        const p = profiles[0];

        // Only expose fields safe for public display
        return NextResponse.json({
            profile: {
                ownerName: p.ownerName,
                shopName: p.shopName,
                startedBusinessAt: p.startedBusinessAt,
                profileImage: p.profileImage,
                phone: p.phone,
                email: p.email,
                address: p.address,
                googleMapsLocation: p.googleMapsLocation,
            }
        });
    } catch (error: any) {
        console.error('Public profile fetch error:', error);
        return NextResponse.json({ profile: null }, { status: 500 });
    }
}
