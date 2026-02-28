import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/app/lib/auth';
import { createSession } from '@/app/lib/session';
import { registerDeviceSession } from '@/app/lib/db-session';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check if ANY user exists in the database
        const existingUsers = await db.select().from(users).limit(1);

        if (existingUsers.length > 0) {
            // If a user exists, this endpoint is locked down forever
            return NextResponse.json(
                { error: 'Setup is locked. An admin account already exists.' },
                { status: 403 }
            );
        }

        // Hash the password securely
        const hashedPassword = await hashPassword(password);

        // Create the first admin user
        const [newUser] = await db.insert(users).values({
            email: email.toLowerCase(),
            passwordHash: hashedPassword,
            role: 'admin',
        }).returning();

        // Register the device session
        const deviceResult = await registerDeviceSession(newUser.id, request);

        if (!deviceResult.success) {
            return NextResponse.json({
                error: 'Device limit exceeded',
                activeSessions: deviceResult.existingSessions
            }, { status: 403 });
        }

        const sessionId = deviceResult.sessionId!;

        // Create a secure session cookie
        await createSession({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            sessionId
        });

        return NextResponse.json({
            success: true,
            message: 'Admin account created successfully. You are now logged in.'
        });

    } catch (error: any) {
        console.error('Setup API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Check if setup is needed (called by the frontend to show the setup screen vs login screen)
export async function GET() {
    try {
        const existingUsers = await db.select().from(users).limit(1);
        return NextResponse.json({ needsSetup: existingUsers.length === 0 });
    } catch (error) {
        console.error('Setup Check Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
