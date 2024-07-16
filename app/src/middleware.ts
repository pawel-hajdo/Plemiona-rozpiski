import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {isExpired} from "react-jwt";
import cookie from 'cookie'

const publicRoutes = ['/login', '/register'];

export function middleware(req: NextRequest) {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;

    const isAuthenticated = token && !isExpired(token);


    if (!isAuthenticated && !publicRoutes.includes(req.nextUrl.pathname)) {
        const absoluteURL = new URL('/login', req.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
