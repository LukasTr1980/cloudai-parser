import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "./constants";

export const getFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLocaleLowerCase();
    return extension ? '.' + extension : '';
};

export const validateFile = (file: File): string | null => {
    const fileExtension = getFileExtension(file.name);
    if (
        !ALLOWED_EXTENSIONS.includes(fileExtension) ||
        !ALLOWED_MIME_TYPES.includes(file.type)
    ) {
        return 'Invalid file type. Only images and PDFs are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
        return `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`;
    }
    return null;
};