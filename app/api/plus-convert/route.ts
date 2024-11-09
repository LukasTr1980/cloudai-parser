import { NextRequest, NextResponse } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { Storage } from "@google-cloud/storage";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { readSecretOrEnvVar } from "@/app/utils/readSecretOrEnvVar";
import mime from 'mime-types';
import { auth } from "@/auth";

interface AuthenticatedRequest extends NextRequest {
    auth: unknown;
}

export const POST = auth(async function POST(req: AuthenticatedRequest) {
    if (!req.auth) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        req.ip ||
        'Unknown';

    const namespace = 'plusConvert';
    const maxRequests = 10;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plusConvert for IP:', ip);
        return NextResponse.json(
            { message: 'Too many requests. Please try again in about a minute.' },
            { status: 429 }
        );
    }

    let response: NextResponse = NextResponse.json({});
    let fileName = '';
    try {
        console.info('Received POST request in /api/plus-convert');

        const { fileName: receivedFileName } = await req.json();
        fileName = receivedFileName;
        console.info('Parsed request body:', { fileName });

        if (!fileName) {
            console.error('File name is missing');
            response = NextResponse.json({ message: 'File name is required' }, { status: 400 });
            return response;
        }

        const bucketName = process.env.GCS_BUCKET_NAME;
        if (!bucketName) {
            console.error('GCS_BUCKET_NAME environment variable is missing');
            response = NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
            return response;
        }

        const gcsInputUri = `gs://${bucketName}/${fileName}`;
        console.info('Constructed GCS Input URI:', gcsInputUri);

        const mimeType = mime.lookup(fileName) || 'application/octet-stream';
        console.info('Determined MIME type:', mimeType);

        const extractedText = await processDocument(gcsInputUri, mimeType);
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
        if (fileName) {
            try {
                const bucketName = process.env.GCS_BUCKET_NAME;
                if (bucketName) {
                    const storage = new Storage();
                    await storage.bucket(bucketName).file(fileName).delete();
                    console.info('Deleted file from GCS:', fileName);
                }
            } catch (deleteError: unknown) {
                console.error('Error deleting file from GCS:', deleteError);
            }
        }
        try {
            response = response || NextResponse.json({});
            response.cookies.delete('file_info');
            console.info('Unset the file_info cookie.');
        } catch (cookieError: unknown) {
            console.error('Error unsetting cookie:', cookieError);
        }
    }

    return response;
});

async function processDocument(
    gcsInputUri: string,
    mimeType: string
): Promise<{
    text: string;
    pageCount?: number;
    detectedLanguages?: string[];
}> {
    console.info('Starting document processing with batch processing');

    const projectId = await readSecretOrEnvVar('google_project_id', 'PROJECT_ID');
    const location = process.env.LOCATION;
    const processorId = await readSecretOrEnvVar('google_processor_id', 'PROCESSOR_ID');
    const outputBucketName = process.env.GCS_OUTPUT_BUCKET_NAME || process.env.GCS_BUCKET_NAME;

    console.info('Project ID:', projectId);
    console.info('Location:', location);
    console.info('Processor ID:', processorId);
    console.info('API Endpoint:', `${location}-documentai.googleapis.com`);
    console.info('Input GCS URI:', gcsInputUri);
    console.info('Output Bucket Name:', outputBucketName);

    if (!projectId || !location || !processorId || !outputBucketName) {
        console.error('Missing required environment variables');
        throw new Error('Missing required environment variables');
    }

    const client = new DocumentProcessorServiceClient({
        apiEndpoint: `${location}-documentai.googleapis.com`,
    });

    const storage = new Storage();

    const outputPrefix = `output/${Date.now()}-${Math.random().toString(36).substr(2, 9)}/`;
    const gcsOutputUri = `gs://${outputBucketName}/${outputPrefix}`;

    console.info('Output GCS URI:', gcsOutputUri);

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    console.info('Processor Name:', name);

    const request = {
        name,
        inputDocuments: {
            gcsDocuments: {
                documents: [
                    {
                        gcsUri: gcsInputUri,
                        mimeType: mimeType,
                    },
                ],
            },
        },
        documentOutputConfig: {
            gcsOutputConfig: {
                gcsUri: gcsOutputUri,
            },
        },
    };

    console.info('Sending batch processing request');

    try {
        const [operation] = await client.batchProcessDocuments(request);

        console.info('Waiting for batch operation to complete...');
        await operation.promise();
        console.info('Batch processing complete.');

        const [files] = await storage.bucket(outputBucketName).getFiles({
            prefix: outputPrefix,
        });

        if (!files || files.length === 0) {
            console.error('No output files found in GCS output bucket.');
            throw new Error('No output files found in GCS output bucket.');
        }

        console.info(`Found ${files.length} output files.`);

        let extractedText = '';
        let pageCount = 0;
        const detectedLanguagesSet = new Set<string>();

        for (const file of files) {
            const [fileContents] = await file.download();
            const document = JSON.parse(fileContents.toString());

            if (document.text) {
                extractedText += document.text;
            }

            if (document.pages) {
                pageCount += document.pages.length;
                for (const page of document.pages) {
                    if (page.detectedLanguages) {
                        for (const lang of page.detectedLanguages) {
                            const confidence = lang.confidence ?? 0;
                            const languageCode = lang.languageCode;
                            if (confidence >= 0.8 && languageCode) {
                                detectedLanguagesSet.add(languageCode);
                            }
                        }
                    }
                }
            }
        }

        const detectedLanguages = Array.from(detectedLanguagesSet);

        console.info('Cleaning up GCS output files...');
        for (const file of files) {
            await file.delete();
        }
        console.info('GCS output files cleanup complete.');

        return {
            text: extractedText,
            pageCount,
            detectedLanguages,
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Document AI batch processing error:', error.message);
            throw new Error(error.message);
        } else {
            console.error('Document AI batch processing error:', error);
            throw new Error('Failed to process document with Document AI batch processing');
        }
    }
}
