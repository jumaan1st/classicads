import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production'
);

export async function createSession(payload: { id: string; email: string; role: string; sessionId: string }) {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(SECRET_KEY);

    (await cookies()).set('auth_session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { id: string; email: string; role: string; sessionId: string };
    } catch (error) {
        console.error('[verifySession] JWT Verification Error:', error);
        return null;
    }
}



export async function clearSession() {
    (await cookies()).delete('auth_session');
}
