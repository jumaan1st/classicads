import { NextResponse } from 'next/server';
import { clearSession } from '@/app/lib/session';
import { getSession } from '@/app/lib/db-session';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const session = await getSession();

        if (session) {
            await db.delete(sessions).where(eq(sessions.id, session.sessionId)).execute();
        }

        await clearSession();
        // Redirect to login after clearing the cookie
        return NextResponse.redirect(new URL('/login', request.url));
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}
