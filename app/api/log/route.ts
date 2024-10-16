import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/app/utils/rateLimiter";
import Joi from "joi";
import { sanitizeObject } from "@/app/utils/sanitizeHtml";

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for') ||
        req.headers.get('x-real-ip') ||
        req.ip ||
        'Unknown';

    const rateLimitKey = `cloud_ai_parser_rate_limit:${ip}`

    const maxRequests = 100;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(rateLimitKey, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route log for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }
    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://cloudai-parser.charts.cx', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route log:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route log');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    try {
        const logData = await req.json();

        const schema = Joi.object({
            eventType: Joi.string().trim().max(100).required(),
            eventData: Joi.object().max(10).required(),
        });

        const { error, value } = schema.validate(logData, { stripUnknown: true });

        if (error) {
            console.error('Validation error in route log:', error.details);
            return NextResponse.json(
                { message: 'Invalid log data details:', details: error.details },
                { status: 500 },
            );
        }

        const { eventType, eventData } = value;

        const sanitizedEventType = sanitizeObject(eventType) as string;
        const sanitizedEventData = sanitizeObject(eventData) as Record<string, unknown>;

        console.info(JSON.stringify({
            message: `Frontend Log: sanitizedEventType=${sanitizedEventType}, sanitizedEventData=${JSON.stringify(sanitizedEventData)}`,
        }));

        return NextResponse.json({ message: 'Log received' }, { status: 200 });
    } catch (error) {
        console.error('Logging Error:', error);
        return NextResponse.json({ message: 'Failed to log data' }, { status: 500 });
    }
}