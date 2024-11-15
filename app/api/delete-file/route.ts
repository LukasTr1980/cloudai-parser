import { NextResponse, NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { isNodeJsErrnoException } from "@/app/utils/readSecretOrEnvVar";
import { FileInfo } from "@/app/types";

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

        const namespace = 'deleteFile';
        const maxRequests = 10;
        const windowInSeconds = 600;

        const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

        if (!isAllowed) {
            console.warn('Rate limit exceeded in route delete-file for IP:', ip);
            return NextResponse.json(
                { message: 'Too many requests. Please try again in about 10 minutes.' },
                { status: 429 }
            );
        }

        const origin = req.headers.get('origin');
        const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
        if (!origin || !allowedOrigins.includes(origin)) {
            console.warn('Invalid origin in route delete-file:', origin)
            return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        }

        const apiToken = req.headers.get('X-Api-Token');
        const cookieToken = req.cookies.get('api_token');
    
        if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
            console.warn('API token mismatch or missing in route delete-file');
            return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
        }
    
        console.info('Received a file delete request');

        const fileInfoCookie = req.cookies.get('file_info');
        if (!fileInfoCookie) {
            console.warn('No file_info cookie found.');
            return NextResponse.json({ message: 'No file information found' }, { status: 400 });
        }

        let fileInfo: FileInfo;
        try {
            fileInfo = JSON.parse(fileInfoCookie.value);
            if (!fileInfo.uniqueName) {
                throw new Error('uniqueName is missing in file_info');
            }
        } catch (error) {
            console.error('Error parsing file_info cookie:', error);
            return NextResponse.json({ message: 'Invalid file information' }, { status: 400 });
        }

        const uploadDirEnv = process.env.UPLOAD_DIRECTORY || '/tmp/';
        const uploadDir = path.join(process.cwd(), uploadDirEnv);
        const filePath = path.join(uploadDir, fileInfo.uniqueName);

        let response: NextResponse = NextResponse.json({});

        try {
            try {
                await fs.access(filePath);
                console.info('File exists at path:', filePath);
            } catch {
                console.warn('File not found at path:', filePath);
                return NextResponse.json({ message: 'File not found' }, { status: 404 });
            }
            await fs.unlink(filePath);
            console.info('Deleted file at path:', filePath);

            response = NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });

            response.cookies.delete('file_info');
            console.info('Unset the file_info cookie');
        } catch (error: unknown) {
            if (isNodeJsErrnoException(error) && error.code === 'ENOENT') {
                console.warn(`File not found when attempting to delete: ${filePath}`);
                response = NextResponse.json({ message: 'File not found' }, { status: 404 });
            } else if (error instanceof Error) {
                console.error('Error deleting File:', error.message);
                response = NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
            } else {
                console.error('Unknown error while deleting file.');
                response = NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
            }
        }

        return response;
}