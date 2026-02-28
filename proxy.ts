import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/app/lib/session';

// Add the routes that require authentication
const protectedRoutes = ['/dashboard'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const sessionCookie = request.cookies.get('auth_session')?.value;
        console.log('[Middleware] Checking path:', pathname);
        console.log('[Middleware] Found cookie auth_session:', !!sessionCookie);

        // If no sessionCookie is present, redirect to login
        if (!sessionCookie) {
            console.log('[Middleware] Redirecting to login: No cookie');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Validate session
        const session = await verifySession(sessionCookie);
        console.log('[Middleware] Sesssion Verification Result:', !!session);

        if (!session) {
            console.log('[Middleware] Redirecting to login: Invalid session, deleting cookie');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            // Clear invalid cookie
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('auth_session');
            return response;
        }
    }

    // Allow next if everything is fine or if route is public
    return NextResponse.next();
}

export const config = {
    // Only run the middleware on matching paths
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
