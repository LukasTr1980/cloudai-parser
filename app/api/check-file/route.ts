import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { rateLimiter } from "@/app/utils/rateLimiter";

export async function GET(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.ip ||
        'Unknown';

    const namespace = 'checkFile';
    const maxRequests = 10;
    const windowInSeconds = 600;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route check-file for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about 10 minutes.' },
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
            console.warn('Invalid origin in route check-file:', origin);
            return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        }
    } else {
        console.info('No Origin header present; assuming same-origin request in route check-file');
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route check-file');
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

    const uploadDirEnv = process.env.UPLOAD_DIRECTORY || '/tmp/';
    const uploadDir = path.join(process.cwd(), uploadDirEnv);
    const filePath = path.join(uploadDir, uniqueName);

    try {
        const fileStats = await fs.stat(filePath);
        const fileSize = fileStats.size;

        await fs.access(filePath);
        console.info(`File exists from route check-file: ${uniqueName} (Original: ${originalName}), Size: ${fileSize} bytes`);
        return NextResponse.json(
            { exists: true, uniqueName, originalName, fileSize },
            { status: 200 }
        );
    } catch (error) {
        console.info(`File not found: ${uniqueName} (Original: ${originalName})`, error);
        return NextResponse.json(
            { exists: false, message: 'File not found in check-file route on server' },
            { status: 200 }
        );
    }
}