import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { Storage } from "@google-cloud/storage";
import { auth } from "@/auth";

interface AuthenticatedRequest extends NextRequest {
    auth: unknown;
}

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || '/tmp/';
const bucket = storage.bucket(bucketName);

export const GET = auth(async function GET(req: AuthenticatedRequest) {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const namespace = 'plusCheckFile';
    const maxRequests = 20;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-check-file for IP:', ip);
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
            console.warn('Invalid origin in route plus-check-file:', origin);
            return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        }
    } else {
        console.info('No Origin header present; assuming same-origin request in route plus-check-file');
    }
    
    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-check-file');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    const fileInfoCookie = req.cookies.get('file_info');

    if (!fileInfoCookie) {
        console.info('No file_info cookie found.');
        return NextResponse.json(
            { exists: false, message: 'No file_info cookie found.' },
            { status: 200 },
        );
    };

    let fileInfo: { originalName: string; uniqueName: string };

    try {
        fileInfo = JSON.parse(fileInfoCookie.value);
    } catch (error) {
        console.error('Failed to parse file_info cookie in check-file route:', error);
        return NextResponse.json(
            { exists: false },
            { status: 200 },
        );
    }

    const { uniqueName, originalName } = fileInfo;

    if (!uniqueName || !originalName) {
        console.warn('Incomplete file information in file_info cookie');
        return NextResponse.json(
            { exists: false },
            { status: 200 },
        );
    }

    try {
        const file = bucket.file(uniqueName);

        const [exists] = await file.exists();

        if (exists) {
            const [metadata] = await file.getMetadata();
            const fileSize = metadata.size;

            console.info(`File exists in GCS: ${uniqueName} (Original: ${originalName}), Size: ${fileSize} bytes`);
            return NextResponse.json(
                { exists: true, uniqueName, originalName, fileSize },
                { status: 200 }
            );
        } else {
            console.info(`File not found in GCS: ${uniqueName} (Original: ${originalName})`);
            return NextResponse.json(
                { exists: false, message: 'File not found in GCS' },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error(`Error accessing file in GCS: ${uniqueName} (Original: ${originalName})`, error);
        return NextResponse.json(
            { exists: false, message: 'Error accessing file in GCS' },
            { status: 200 }
        );
    }

});