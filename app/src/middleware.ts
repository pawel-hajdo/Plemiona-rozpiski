import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {isExpired} from "react-jwt";
import cookie from 'cookie'
import { decodeToken } from "react-jwt";

const publicRoutes = ['/login', '/register', '/reset'];
const adminRoutes = ['/admin'];

export interface JwtPayload {
    roles: string[];
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

    if (isAuthenticated && adminRoutes.some(route => pathname.startsWith(route))) {
        try {
            const decoded = decodeToken(token) as JwtPayload;
            const hasAdminRole = decoded?.roles.includes('ROLE_ADMIN');

            if (!hasAdminRole) {
                return NextResponse.redirect(new URL('/', req.url));
            }
        } catch (error) {
            console.error(error)
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
