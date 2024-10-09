import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from "path";
import { validateFile } from "@/app/utils/apifilevalidation";
import { generateUUID } from "@/app/utils/uuid";


export async function POST(request: NextRequest) {
    console.info('Received a file upload request');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.info('Validating file');
    const validationResult = await validateFile(file);
    if (!validationResult.valid) {
        console.warn('File validation failed:', validationResult.message);
        return NextResponse.json({ message: validationResult.message }, { status: 400 });
    }

    const { buffer, extensionFromType } = validationResult;
    const uploadDir = path.join(process.cwd(), 'uploads');

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
        return NextResponse.json({ message: 'File uploaded successfully!', fileName: uniqueFileName }, { status: 200 });
    } catch (error) {
        console.error('Error while saving file:', error);
        return NextResponse.json({ message: 'Failed to save file' }, { status: 500 });
    }
}