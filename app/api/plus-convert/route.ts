import { NextRequest, NextResponse } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { readSecretOrEnvVar } from "@/app/utils/readSecretOrEnvVar";
import mime from 'mime-types';
import { auth } from "@/auth";
import clientPromise from "@/app/utils/db";

export const POST = async (req: NextRequest) => {
    const session = await auth();
    
    if (!session?.user.id) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.id;

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
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

        const operationName = await initiateDocumentProcessing(gcsInputUri, mimeType, fileName, userId);

        response = NextResponse.json({
            message: 'Document processing has started',
            operationName: operationName
        }, { status: 202 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Conversion error:', error.stack);
            const errorMessage = error.message;
            response = NextResponse.json({ message: errorMessage }, { status: 500 });
        } else {
            console.error('Unknown conversion error:', error);
            response = NextResponse.json({ message: 'Conversion failed' }, { status: 500 });
        }
    }

    return response;
};

async function initiateDocumentProcessing(
    gcsInputUri: string,
    mimeType: string,
    fileName: string,
    userId: string
): Promise<string> {
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

        if (!operation.name) {
            throw new Error('Operation name is undefined. Failed to initiate document processing.');
        }

        await storeOperationDetails(userId, operation.name, fileName, outputPrefix);

        console.info(`Batch processing initiated. Operation name: ${operation.name}`);

        return operation.name;
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

async function storeOperationDetails(userId: string, operationName: string, fileName: string, outputPrefix: string) {
    try {
        const client = await clientPromise;
        const db = client.db('tlxtech');
        const operationsCollection = db.collection('operations');

        const operationData = {
            userId,
            operationName,
            fileName,
            outputPrefix,
            createdAt: new Date(),
        };

        await operationsCollection.insertOne(operationData);

        console.info(`Operation details stored in MongoDB for user ${userId}: operationName=${operationName}, fileName=${fileName}, outputPrefix=${outputPrefix}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error storing operation details in MongoDB:', error.message);
            throw new Error(error.message);
        } else {
            console.error('Error storing operation details in MongoDB:', error);
            throw new Error('Error storing operation details in MongoDB.');
        }
    }
}