import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const token = req.cookies.get('api_token');

    if(!token) {
        const newToken = uuidv4();
        res.cookies.set('api_token', newToken, {
            httpOnly: false,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
    }
    return res;
}

export const config = {
    matcher: '/:path*',
};