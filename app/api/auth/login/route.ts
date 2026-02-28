import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/app/lib/auth';
import { createSession } from '@/app/lib/session';
import { registerDeviceSession } from '@/app/lib/db-session';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, password, revokeSessionId } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // For login we can use either email or phone depending on the input
        // The user mentioned "email or phone by forget password" so we should support both.
        // For now we'll check if the input is an email, but we can query by both.
        const isEmail = email.includes('@');

        const userRecords = await db
            .select()
            .from(users)
            .where(isEmail ? eq(users.email, email.toLowerCase()) : eq(users.phone, email))
            .limit(1);

        const user = userRecords[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Register the device and enforce limits
        const deviceResult = await registerDeviceSession(user.id, request, revokeSessionId);

        if (!deviceResult.success) {
            return NextResponse.json({
                error: 'Device limit exceeded',
                activeSessions: deviceResult.existingSessions
            }, { status: 403 });
        }

        const sessionId = deviceResult.sessionId!;

        // Set secure JWT cookie
        await createSession({
            id: user.id,
            email: user.email,
            role: user.role,
            sessionId
        });

        return NextResponse.json({ success: true, message: 'Logged in successfully' });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
