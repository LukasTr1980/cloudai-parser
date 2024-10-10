import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from 'fs';
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import mime from 'mime-types';

export async function POST(request: NextRequest) {
    let filePath = '';
    try {
        console.info('Received POST request in /api/convert');
        const { fileName } = await request.json();
        console.info('Parsed request body:', { fileName });
        if (!fileName) {
            console.error('File name is missing');
            return NextResponse.json({ message: 'File name is required' }, { status: 400 });
        }

        filePath = path.join(process.cwd(), 'uploads', fileName);
        console.info('Constructed file path:', filePath);

        try {
            await fs.access(filePath);
            console.info('File exists at path:', filePath);
        } catch {
            console.error('File not found at path:', filePath);
            return NextResponse.json({ message: 'File not found' }, { status: 400 });
        }

        const fileBuffer = await fs.readFile(filePath);
        console.info('Read file successfully, size:', fileBuffer.length);
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        console.info('Determined MIME type:', mimeType);

        const exctractedText = await processDocument(fileBuffer, mimeType);
        console.info('Extracted text from document successfully');

        return NextResponse.json({ message: 'Conversion successful', data: exctractedText }, { status: 200 });
    } catch (error) {
        console.error('Conversion error:', error);
        return NextResponse.json({ message: 'Conversion failed' }, { status: 500 });
    } finally {
        if (filePath) {
            try {
                await fs.unlink(filePath);
                console.info('Deleted file at path:', filePath);
            } catch (deleteError) {
                console.error('Error deleting file:', deleteError);
            }
        }
    }
}

async function processDocument(fileBuffer: Buffer, mimeType: string): Promise<string> {
    console.info('Starting document processing');

    const projectId = process.env.PROJECT_ID;
    const location = process.env.LOCATION;
    const processorId = process.env.PROCESSOR_ID;
    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    console.info('Project ID:', projectId);
    console.info('Location:', location);
    console.info('Processor ID:', processorId);
    console.info('Key Filename:', keyFilename);
    console.info('API Endpoint:', `${location}-documentai.googleapis.com`);


    if (!projectId || !location || !processorId || !keyFilename) {
        console.error('Missing required environment variables');
        throw new Error('Missing required environment variables');
    }

    const client = new DocumentProcessorServiceClient({
        keyFilename: path.join(process.cwd(), keyFilename),
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

        console.info('Document text extracted successfully');
        return document.text;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Document AI processing error:', error.message);
        } else {
            console.error('Document AI processing error:', error);

        }
        throw new Error('Failed to process document with Document AI');
    }
}

