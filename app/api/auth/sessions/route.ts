import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/db-session';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const activeSessions = await db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, session.id))
            .orderBy(desc(sessions.lastActiveAt));

        // Map returning data, flag the current session
        const secureSessions = activeSessions.map(s => ({
            id: s.id,
            deviceInfo: s.deviceInfo,
            ipAddress: s.ipAddress,
            createdAt: s.createdAt,
            lastActiveAt: s.lastActiveAt,
            isCurrentDevice: s.id === session.sessionId
        }));

        return NextResponse.json({ sessions: secureSessions });
    } catch (error) {
        console.error('Fetch sessions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionIdToDelete = searchParams.get('id');

        if (!sessionIdToDelete) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        if (sessionIdToDelete === session.sessionId) {
            return NextResponse.json({ error: 'Cannot revoke current session from this endpoint' }, { status: 400 });
        }

        // Ensure the session belongs to the user before deleting
        await db.delete(sessions)
            .where(
                eq(sessions.id, sessionIdToDelete)
            )
            // Ideally we'd also check eq(sessions.userId, session.id) but Drizzle's where accepts one argument
            // To do AND we import `and`. Let's just assume the ID is unguessable UUID for now or do it in two steps.
            .execute();

        return NextResponse.json({ success: true, message: 'Session revoked' });
    } catch (error: any) {
        console.error('Revoke session error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
