import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { isNodeJsErrnoException } from "@/app/utils/readSecretOrEnvVar";
import { FileInfo } from "@/app/types";
import { Storage } from "@google-cloud/storage";
import { auth } from "@/auth";

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || '/tmp/';
const bucket = storage.bucket(bucketName);

export const POST = async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const namespace = 'plusDeleteFile';
    const maxRequests = 10;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-delete-file for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about a minute.' },
            { status: 429 }
        );
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://tlx.page', 'https://blue.tlx.page', 'https://green.tlx.page', 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
        console.warn('Invalid origin in route plus-delete-file:', origin)
        return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-delete-file');
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

    const uniqueFileName = fileInfo.uniqueName;

    let response: NextResponse = NextResponse.json({});

    try {
        const file = bucket.file(uniqueFileName);

        const [exists] = await file.exists();
        if (!exists) {
            console.warn('File not found in GCS bucket:', uniqueFileName)
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }
        console.info('File exists in GCS bucket:', uniqueFileName);

        await file.delete();
        console.info('Deleted file from GCS bucket:', uniqueFileName);

        response = NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
        response.cookies.delete('file_info');
        console.info('Unset the file_info cookie');
    } catch (error) {
        if (isNodeJsErrnoException(error) && error.code === 'ENOENT') {
            console.warn(`File not found when attempting to delete: ${uniqueFileName}`);
            response = NextResponse.json({ message: 'File not found' }, { status: 404 });
        } else if (error instanceof Error) {
            console.error('Error deleting file form GCS:', error.message);
            response = NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
        } else {
            console.error('Unkown error while deleting file form GCS.');
            response = NextResponse.json({ message: 'Failed to delete file' }, { status: 500 });
        }
    }
    return response;
};