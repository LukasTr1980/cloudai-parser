export const truncateFileName = (fileName: string, maxLength: number): string => {
    if (fileName.length <= maxLength) {
        return fileName;
    } else {
        const extension = '.' + fileName.split('.').pop();
        const baseName = fileName.slice(0, fileName.length - extension.length);
        const truncatedBaseName = baseName.slice(0, maxLength - extension.length - 3) + '...';
        return truncatedBaseName + extension;
    }
};