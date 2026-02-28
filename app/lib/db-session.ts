import { verifySession, clearSession } from '@/app/lib/session';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

// Using React's cache() ensures this database query is executed precisely ONCE 
// per server-render pass, even if multiple components call getSession()
export const getSession = cache(async () => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session')?.value;

    if (!sessionCookie) return null;

    const jwtPayload = await verifySession(sessionCookie);
    if (!jwtPayload) return null;

    // Check PostgreSQL database if the remote session is still active
    const sessionRecords = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, jwtPayload.sessionId))
        .limit(1);

    const activeSession = sessionRecords[0];

    if (!activeSession) {
        // The session was remotely revoked or auto-kicked.
        // We cannot delete cookies in a Server Component, so we just return null.
        // The layout will redirect the user to login.
        return null;
    }

    // Fire-and-forget background update for lastActiveAt
    db.update(sessions)
        .set({ lastActiveAt: new Date() })
        .where(eq(sessions.id, activeSession.id))
        .execute()
        .catch(err => console.error("Failed to update lastActiveAt", err));

    return {
        id: jwtPayload.id,
        email: jwtPayload.email,
        role: jwtPayload.role,
        sessionId: activeSession.id
    };
});

import { UAParser } from 'ua-parser-js';
import { MAX_DEVICES } from './constants';
import { desc, asc } from 'drizzle-orm';

export async function registerDeviceSession(
    userId: string,
    request: Request,
    revokeSessionId?: string
): Promise<{ success: boolean; sessionId?: string; existingSessions?: any[] }> {
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

    // Parse device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceInfo = 'Unknown Device';
    if (result.os.name && result.browser.name) {
        deviceInfo = `${result.os.name} on ${result.browser.name}`;
    } else if (result.device.vendor && result.device.model) {
        deviceInfo = `${result.device.vendor} ${result.device.model}`;
    } else if (result.browser.name) {
        deviceInfo = `Unknown OS on ${result.browser.name}`;
    }

    // If user passed a session to revoke, delete it first
    if (revokeSessionId) {
        await db.delete(sessions).where(eq(sessions.id, revokeSessionId)).execute();
    }

    // Check existing active sessions for this user
    const existingSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.lastActiveAt));

    // Rather than auto-kicking, we now block the login if the device limit is reached
    // and return the list of devices so the frontend can display the modal.
    if (existingSessions.length >= MAX_DEVICES) {
        return { success: false, existingSessions };
    }

    // Insert new session
    const [newSession] = await db.insert(sessions).values({
        userId,
        deviceInfo,
        ipAddress: ipAddress.substring(0, 45) // limit to varchar(45)
    }).returning();

    return { success: true, sessionId: newSession.id };
}
