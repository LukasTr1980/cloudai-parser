import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from "path";
import { apiValidateFile } from "@/app/utils/apifilevalidation";
import { generateUUID } from "@/app/utils/uuid";
import { rateLimiter } from "@/app/utils/rateLimiter";


export async function POST(req: NextRequest) {
    const ip = 
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'Unknown';

    const namespace = 'upload';
    const maxRequests = 10;
    const windowInSeconds = 600;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route upload for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about a 10 minutes.' },
            { status: 429 }
        );
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route upload:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route upload');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    console.info('Received a file upload request');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    const validationResult = await apiValidateFile(file);
    if (!validationResult.valid) {
        console.warn('File validation failed:', validationResult.message);
        return NextResponse.json({ message: validationResult.message }, { status: 400 });
    }

    const { buffer, extensionFromType } = validationResult;

    const uploadDirEnv = process.env.UPLOAD_DIRECTORY || '/tmp/';
    const uploadDir = path.join(process.cwd(), uploadDirEnv);

    try {
        console.info('Creating upload directory if it does not exist:', uploadDir);
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error('Error creating upload directory:', error);
        return NextResponse.json(
            { message: 'Failed to create upload directory' },
            { status: 500 }
        );
    }

    const uniqueFileName = `${generateUUID()}${extensionFromType}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    try {
        console.info('Saving file to path:', filePath);
        await fs.writeFile(filePath, buffer);
        console.info('File uploaded successfully:', uniqueFileName);

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
        console.error('Error while saving file:', error);
        return NextResponse.json({ message: 'Failed to save file' }, { status: 500 });
    }
}