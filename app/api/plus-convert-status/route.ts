import { NextResponse, NextRequest } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { readSecretOrEnvVar } from "@/app/utils/readSecretOrEnvVar";
import { auth } from "@/auth";
import clientPromise from "@/app/utils/db";
import { rateLimiter } from "@/app/utils/rateLimiter";
import { Storage } from "@google-cloud/storage";

export const GET = async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const namespace = 'plusConvertStatus';
    const maxRequests = 100;
    const windowInSeconds = 60;

    const isAllowed = await rateLimiter(namespace, ip, maxRequests, windowInSeconds);

    if (!isAllowed) {
        console.warn('Rate limit exceeded in route plus-convert-status for IP:', ip);
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
            console.warn('Invalid origin in route plus-convert-status:', origin);
            return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
        }
    } else {
        console.info('No Origin header present; assuming same-origin request in route plus-convert-status');
    }

    const apiToken = req.headers.get('X-Api-Token');
    const cookieToken = req.cookies.get('api_token');

    if (!apiToken || !cookieToken || apiToken !== cookieToken.value) {
        console.warn('API token mismatch or missing in route plus-convert-status');
        return NextResponse.json({ message: 'Invalid api token' }, { status: 403 });
    }

    const operationNameEncoded = req.nextUrl.searchParams.get('operationName');
    if (!operationNameEncoded) {
        return NextResponse.json({ message: 'Operation name is required' }, { status: 400 });
    }

    const operationName = decodeURIComponent(operationNameEncoded);

    const operationDetails = await retrieveOperationDetails(operationName, userId);
    if (!operationDetails) {
        return NextResponse.json({ message: 'No such operation found' }, { status: 404 });
    }

    let response: NextResponse = NextResponse.json({});
    try {
        const projectId = await readSecretOrEnvVar('google_project_id', 'PROJECT_ID');
        const location = process.env.LOCATION;
        const client = new DocumentProcessorServiceClient({
            apiEndpoint: `${location}-documentai.googleapis.com`,
        });

        const operation = await client.checkBatchProcessDocumentsProgress(operationName);

        if (!projectId || !location) {
            console.error('Missing required environment variables');
            throw new Error('Missing required environment variables');
        }

        if (operation.done) {
            const extractedData = await finalizeDocumentProcessing(
                projectId,
                location,
                operationName,
                operationDetails.fileName,
                operationDetails.outputPrefix,
                userId
            );

            response = NextResponse.json({
                message: 'Document processing completed',
                data: extractedData
            }, { status: 200 });

            response.cookies.delete('file_info');
            console.info('Unset the file_info cookie');
        } else {
            response = NextResponse.json({
                message: 'Document processing still in progress'
            }, { status: 202 });
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error checking operation status:', error.stack);
            const errorMessage = error.message;
            response = NextResponse.json({ message: errorMessage }, { status: 500 });
        } else {
            console.error('Unknown error checking operation status:', error);
            response = NextResponse.json({ message: 'Checking status failed' }, { status: 500 });
        }
    }
    return response;
};

async function retrieveOperationDetails(operationName: string, userId: string) {
    try {
        const client = await clientPromise;
        const db = client.db('tlxtech');
        const operationsCollection = db.collection('operations');

        const operation = await operationsCollection.findOne({ operationName, userId });

        if (operation) {
            return operation;
        } else {
            return null;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error retrieving operation details from MongoDB:', error.message);
            throw new Error(error.message);
        } else {
            console.error('Unknown error retrieving operation details from MongoDB:', error);
            throw new Error('Unknown error retrieving operation details from MongoDB');
        }
    }
}

async function finalizeDocumentProcessing(
    projectId: string,
    location: string,
    operationName: string,
    fileName: string,
    outputPrefix: string,
    userId: string
): Promise<{
    text: string;
    pageCount?: number;
    detectedLanguages?: string[];
}> {
    const outputBucketName = process.env.GCS_BUCKET_NAME;

    if (!outputBucketName) {
        console.error('GCS_BUCKET_NAME enviroment variable is missing');
        throw new Error('Server configuration Error');
    }

    const storage = new Storage();
    console.info('Document AI operation is complete. Retrieving output...');

    const [files] = await storage.bucket(outputBucketName).getFiles({ prefix: outputPrefix });

    if (!files || files.length === 0) {
        console.error('No output files found in GCS bucket.');
        throw new Error('No output files found in GCS bucket.');
    }

    console.info(`Found ${files.length} output files`);

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

    console.info('GCS output files cleanup complete.')

    try {
        const bucketName = process.env.GCS_BUCKET_NAME;
        if (bucketName) {
            await storage.bucket(bucketName).file(fileName).delete();
            console.info('Deleted file from GCS:', fileName);
        }
    } catch (deleteError: unknown) {
        console.error('Error deleting file form GCS:', deleteError);
    }

    await deleteOperationDetails(operationName, userId);

    return {
        text: extractedText,
        pageCount,
        detectedLanguages,
    };
}

async function deleteOperationDetails(operationName: string, userId: string) {
    try {
        const client = await clientPromise;
        const db = client.db("tlxtech");
        const operationsCollection = db.collection("operations");

        const result = await operationsCollection.deleteOne({ operationName, userId });

        if (result.deletedCount === 1) {
            console.info(`Operation details for ${operationName} deleted from MongoDB`)
        } else {
            console.warn(`No operation details found for ${operationName} to delete`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error deleting operation details from MongoDB:', error.message);
            throw new Error(`Error deleting operation details from MongoDB: ${error.message}`);
        } else {
            console.error('Error deleting operation details from MongoDB:', error);
            throw new Error('Error deleting operation details from MongoDB.');
        }
    }
}