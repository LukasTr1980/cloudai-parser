import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/app/utils/rateLimiter";

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.ip ||
        'Unknown';

    const namespace = 'cspReport';
    const maxRequests = 10;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route csp-report for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }
    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route csp-report:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    try {
        const contentType = req.headers.get('content-type') || '';
        let report;

        if (contentType.includes('application/json') || contentType.includes('application/csp-report')) {
            const body = await req.json();
            report = body['csp-report'] || body;
        } else {
            console.warn('CSP Violation: Unsupported content type:', contentType);
            return NextResponse.json({ message: 'Unsupported content type' }, { status: 400 });
        }

        console.warn('CSP Violation:', JSON.stringify(report));

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error processing CPS Violation report:', error);
        return NextResponse.json({ message: 'Error processing CPS Violation report' }, { status: 400 });
    }
}

export function OPTIONS() {
    return NextResponse.json(null, {
        status: 204,
        headers: {
            Allow: 'POST, OPTIONS',
        },
    });
}

export function GET() {
    return NextResponse.json({ message: 'Method not Allowed' }, { status: 405 });
}