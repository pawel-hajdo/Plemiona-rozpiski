import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {isExpired} from "react-jwt";
import cookie from 'cookie'
import { decodeToken } from "react-jwt";

const publicRoutes = ['/login', '/register', '/reset'];
const adminRoutes = ['/admin'];
const reportsRoutes = ['/reports'];

export interface JwtPayload {
    adminWorlds?: string[];
    reportsAccess?: boolean;
}

export function middleware(req: NextRequest) {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;
    const isAuthenticated = token && !isExpired(token);

    const { pathname } = req.nextUrl;

    if (isAuthenticated && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    if (!isAuthenticated && !publicRoutes.includes(req.nextUrl.pathname)) {
        const absoluteURL = new URL('/login', req.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

    if (isAuthenticated) {
        try {
            const decoded = decodeToken(token) as JwtPayload;

            // Admin check
            if (adminRoutes.some(route => pathname.startsWith(route))) {
                const worldPath = pathname.split('/')[2]; // /admin/[world]
                if (!decoded?.adminWorlds?.includes(worldPath)) {
                    return NextResponse.redirect(new URL('/', req.url));
                }
            }

            // Reports access check
            if (reportsRoutes.some(route => pathname.startsWith(route))) {
                if (!decoded?.reportsAccess) {
                    return NextResponse.redirect(new URL('/', req.url));
                }
            }

        } catch (error) {
            console.error(error);
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
