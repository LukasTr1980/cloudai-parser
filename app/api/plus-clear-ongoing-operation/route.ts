import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/utils/db";
import { auth } from "@/auth";
import { rateLimiter } from "@/app/utils/rateLimiter";

export const POST = async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'Unknown';

    const namespace = 'plusClearOngoingOperation';
    const maxRequests = 100;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-clear-ongoing-operation for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about a minute.' },
            { status: 429 }
        );
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route plus-clear-ongoing-operation:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-clear-ongoing-operation');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }


    try {
        const client = await clientPromise;
        const db = client.db('tlxtech');
        const operationsCollection = db.collection('operations');

        await operationsCollection.deleteOne({ userId });

        return NextResponse.json({ message: 'Ongoing operation cleared' }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error clearing ongoing operation:', error);
        return NextResponse.json({ message: 'Failed to clear ongoing operation' }, { status: 500 });
    }
};