import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email or phone number is required' }, { status: 400 });
        }

        const isEmail = email.includes('@');

        // 1. Find user by email or phone
        const userRecords = await db
            .select()
            .from(users)
            .where(isEmail ? eq(users.email, email.toLowerCase()) : eq(users.phone, email))
            .limit(1);

        const user = userRecords[0];

        // NOTE: Security best practice - don't reveal if user exists or not.
        // Just return success for any email submitted.
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If that account exists, an OTP has been sent.'
            });
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

        // 3. Clear existing tokens for this user
        await db.delete(verificationTokens).where(eq(verificationTokens.email, user.email));

        // 4. Save new OTP
        await db.insert(verificationTokens).values({
            email: user.email,
            token: otp,
            expiresAt,
        });

        // 5. Send Email via Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Classic Ads Admin" <${process.env.EMAIL_USER}>`,
            to: user.email, // Always send to the registered email address regardless if they entered phone
            subject: 'Your Password Reset OTP Code',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Classic Ads admin account.</p>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 5px; color: #3b82f6; font-size: 32px;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
        });

        return NextResponse.json({
            success: true,
            message: 'If that account exists, an OTP has been sent.',
            sentToEmail: true
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
