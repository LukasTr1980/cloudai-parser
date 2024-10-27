export const sanitizeFileName = (fileName: string): string => {
    const baseName = fileName.replace(/^.*[\\/]/, '');
    return baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};