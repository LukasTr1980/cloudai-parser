import { fileTypeFromBuffer } from "file-type";
import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from "./constants";
import path from "path";
import filenamify from "filenamify";
import { ValidationResult } from "../types";

export async function validateFile(file: File): Promise<ValidationResult> {
    console.info('Starting file validation');

    if (!file) {
        console.warn('No file uploaded');
        return { valid: false, message: 'No file uploaded' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.info('File size:', buffer.length);

    if (buffer.length > MAX_FILE_SIZE) {
        console.warn('File size exceeds the maximum limit');
        return {
            valid: false,
            message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        };
    }

    const fileTypeResult = await fileTypeFromBuffer(buffer);
    if (!fileTypeResult || !ALLOWED_MIME_TYPES.includes(fileTypeResult.mime)) {
        console.warn('Invalid file content type:', fileTypeResult ? fileTypeResult.mime : 'unkown');
        return {
            valid: false,
            message: 'Invalid file content. The file does not match the expected format.',
        };
    }

    console.info('File type detected:', fileTypeResult.mime);

    const originalFileName = filenamify(file.name);
    const fileExtension = path.extname(originalFileName).toLowerCase();
    const extensionFromType = '.' + fileTypeResult.ext;

    if (!ALLOWED_EXTENSIONS.includes(extensionFromType)) {
        console.warn('File extension does not match file content:', extensionFromType);
        return {
            valid: false,
            message: 'File extension does not match the file content.',
        };
    }

    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        console.warn('Invalid file extension:', fileExtension);
        return {
            valid: false,
            message: 'Invalid file extension. Only images and PDFs are allowed.',
        };
    }
    
    console.info('File validation passed');
    return { valid: true, buffer, extensionFromType };
}