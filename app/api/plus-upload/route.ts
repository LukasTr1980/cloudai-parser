import { NextRequest, NextResponse } from "next/server";
import { apiValidateFile } from "@/app/utils/apifilevalidation";
import { generateUUID } from "@/app/utils/uuid";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { Storage } from "@google-cloud/storage";
import { auth } from "@/auth";

const storage = new Storage();
const uploadBucketName = process.env.GCS_BUCKET_NAME || '/tmp/';

export const POST = auth(async function POST(req: NextRequest) {
    if (!(req as any).auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.ip ||
    'Unknown';

    const namespace = 'plusUpload';
    const maxRequests = 10;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-upload for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route plus-upload:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-upload');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    console.info('Received a file plus-upload request');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    const validationResult = await apiValidateFile(file);
    if (!validationResult.valid) {
        console.warn('File validation failed:', validationResult.message);
        return NextResponse.json({ message: validationResult.message }, { status: 400 });
    }

    const { buffer, extensionFromType } = validationResult;
    const uniqueFileName = `${generateUUID()}${extensionFromType}`;

    const bucket = storage.bucket(uploadBucketName);
    const fileUpload = bucket.file(uniqueFileName);

    try {
        await fileUpload.save(buffer, {
            metadata: { contentType: file.type },
            resumable: false,
        });

        console.info(`File uploaded to GCS: ${uniqueFileName}`);

        const originalFilename = file.name;

        const fileInfo = JSON.stringify({
            originalName: originalFilename,
            uniqueName: uniqueFileName,
        });

        const response = NextResponse.json(
            { message: 'File uploaded successfully!', fileName: uniqueFileName },
            { status: 200 }
        );

        response.cookies.set('file_info', fileInfo, {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 12,
        });

        return response;
    } catch (error) {
        console.error('GCS upload failed:', error);
        return NextResponse.json(
            { message: 'Failed to save file.' },
            { status: 500 }
        );
    }

});