import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from 'fs';
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import mime from 'mime-types';
import { rateLimiter } from "@/app/utils/rateLimiter";
import { readSecretOrEnvVar, isNodeJsErrnoException } from "@/app/utils/readSecretOrEnvVar";

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const namespace = 'convert';
    const maxRequests = 10;
    const windowInSeconds = 600;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route convert for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about 10 minutes.' },
            { status: 429 }
        );
    }

    let filePath = '';
    let response: NextResponse = NextResponse.json({});
    try {
        console.info('Received POST request in /api/convert');
        const { fileName } = await req.json();
        console.info('Parsed request body:', { fileName });
        if (!fileName) {
            console.error('File name is missing');
            response = NextResponse.json({ message: 'File name is required' }, { status: 400 });
            return response;
        }

        filePath = path.join(process.cwd(), 'uploads', fileName);
        console.info('Constructed file path:', filePath);

        try {
            await fs.access(filePath);
            console.info('File exists at path:', filePath);
        } catch {
            console.error('File not found at path:', filePath);
            response = NextResponse.json({ message: 'File not found' }, { status: 400 });
            return response;
        }

        const fileBuffer = await fs.readFile(filePath);
        console.info('Read file successfully, size:', fileBuffer.length);
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        console.info('Determined MIME type:', mimeType);

        const extractedText = await processDocument(fileBuffer, mimeType);
        console.info('Extracted text from document successfully');

        response = NextResponse.json({ message: 'Conversion successful', data: extractedText }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Conversion error:', error.stack);
            const errorMessage = error.message;
            response = NextResponse.json({ message: errorMessage }, { status: 500 });
        } else {
            console.error('Unknown conversion error:', error);
            response = NextResponse.json({ message: 'Conversion failed' }, { status: 500 });
        }
    } finally {
        if (filePath) {
            try {
                await fs.unlink(filePath);
                console.info('Deleted file at path:', filePath);
            } catch (deleteError: unknown) {
                if (isNodeJsErrnoException(deleteError) && deleteError.code === 'ENOENT') {
                    console.warn(`File not found when attempting to delete: ${filePath}`);
                } else if (deleteError instanceof Error) {
                    console.error('Error deleting file:', deleteError);
                } else {
                    console.error('Unknown error while deleting file.');
                }
            }
            try {
                response.cookies.delete('file_info');
                console.info('Unset the file_info cookie.');
            } catch (cookieError: unknown) {
                if (cookieError instanceof Error) {
                    console.error('Error unsetting cookie:', cookieError.message);
                } else {
                    console.error('Unknown error while unsetting cookie.');
                }
            }
        }
    }
    return response;
}

async function processDocument(fileBuffer: Buffer, mimeType: string): Promise<{
    text: string;
    pageCount?: number;
    detectedLanguages?: string[];
}> {
    console.info('Starting document processing');

    const projectId = await readSecretOrEnvVar('google_project_id', 'PROJECT_ID');
    const location = process.env.LOCATION;
    const processorId = await readSecretOrEnvVar('google_processor_id', 'PROCESSOR_ID');

    console.info('Project ID:', projectId);
    console.info('Location:', location);
    console.info('Processor ID:', processorId);
    console.info('API Endpoint:', `${location}-documentai.googleapis.com`);


    if (!projectId || !location || !processorId) {
        console.error('Missing required environment variables');
        throw new Error('Missing required environment variables');
    }

    const client = new DocumentProcessorServiceClient({
        apiEndpoint: `${location}-documentai.googleapis.com`,
    });

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    console.info('Processor Name:', name);

    const request = {
        name,
        rawDocument: {
            content: fileBuffer.toString('base64'),
            mimeType: mimeType,
        },
    };

    console.info('Sending document processing request');

    try {
        const [result] = await client.processDocument(request);

        const { document } = result;

        if (!document || !document.text) {
            console.error('No text extracted from document');
            throw new Error('No text extracted from document');
        }

        const text = document.text;
        const pageCount = document.pages?.length || 0;
        let detectedLanguages: string[] = [];

        if (document.pages) {
            const languageSet = new Set<string>();
            for (const page of document.pages) {
                const detectedLanguages = page.detectedLanguages || [];
                for (const lang of detectedLanguages) {
                    const confidence = lang.confidence ?? 0;
                    const languageCode = lang.languageCode;
                    if (confidence >= 0.8 && languageCode) {
                        languageSet.add(languageCode);
                    }
                }

            }
            detectedLanguages = Array.from(languageSet);
        }

        return {
            text,
            pageCount,
            detectedLanguages,
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Document AI processing error:', error.message);
            throw new Error(error.message);
        } else {
            console.error('Document AI processing error:', error);
            throw new Error('Failed to process document with Document AI');
        }
    }
}

