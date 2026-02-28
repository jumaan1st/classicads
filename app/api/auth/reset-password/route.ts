import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { hashPassword } from '@/app/lib/auth';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, token, newPassword } = await request.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json(
                { error: 'Email/phone, OTP token, and new password are required' },
                { status: 400 }
            );
        }

        // 1. Find user email (since they might have entered a phone number)
        const isEmail = email.includes('@');
        const userRecords = await db
            .select()
            .from(users)
            .where(isEmail ? eq(users.email, email.toLowerCase()) : eq(users.phone, email))
            .limit(1);

        const user = userRecords[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid OTP or expired' }, { status: 400 });
        }

        // 2. Look up the OTP for the resolved email
        const tokenRecords = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.email, user.email),
                    eq(verificationTokens.token, token),
                    gt(verificationTokens.expiresAt, new Date()) // Ensure not expired
                )
            )
            .limit(1);

        const validToken = tokenRecords[0];

        if (!validToken) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // 3. Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // 4. Update the user's password
        await db.update(users)
            .set({ passwordHash: hashedPassword })
            .where(eq(users.id, user.id));

        // 5. Delete the used OTP
        await db.delete(verificationTokens)
            .where(eq(verificationTokens.id, validToken.id));

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
