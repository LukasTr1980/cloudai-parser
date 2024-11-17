import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/utils/db";
import { auth } from "@/auth";
import { rateLimiter } from "@/app/utils/rateLimiter";

export const GET = async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const namespace = 'plusGetOngoingOperation';
    const maxRequests = 100;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-get-ongoing-operation for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about a minute.' },
            { status: 429 }
        );
    }

    const origin = req.headers.get('origin');

    if (origin) {
        const allowedOrigins = [
            'https://tlx.page',
            'https://blue.tlx.page',
            'https://green.tlx.page',
            'http://localhost:3000'
        ];
        if (!allowedOrigins.includes(origin)) {
            console.warn('Invalid origin in route plus-get-ongoing-operation:', origin);
            return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        }
    } else {
        console.info('No Origin header present; assuming same-origin request in route plus-get-ongoing-operation');
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-get-ongoing-operation');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('tlxtech');
        const operationsCollection = db.collection('operations');

        const ongoingOperation = await operationsCollection.findOne({ userId });

        if (ongoingOperation) {
            return NextResponse.json(
                { ongoingOperation },
                { status: 200 },
            );
        } else {
            return new NextResponse(null, { status: 204 });
        }
    } catch (error: unknown) {
        console.error('Error retrieving ongoing operation:', error);
        return NextResponse.json(
            { message: 'Failed to retrieve ongoing operation' },
            { status: 500 }
        );
    }
};