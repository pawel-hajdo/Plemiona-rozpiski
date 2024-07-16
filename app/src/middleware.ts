import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {isExpired} from "react-jwt";

const publicRoutes = ['/login', '/register'];

export function middleware(req: NextRequest) {
    const isAuthenticated = false;


    if (!isAuthenticated && !publicRoutes.includes(req.nextUrl.pathname)) {
        const absoluteURL = new URL('/login', req.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
