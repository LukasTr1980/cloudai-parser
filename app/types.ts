import { RefObject } from "react";

export type ValidationResult =
    | {
        valid: true;
        buffer: Buffer;
        extensionFromType: string;
    }
    | {
        valid: false;
        message: string;
    };

export interface FileUploadAreaProps {
    selectedFile: File | null;
    onFileSelect: (file: File) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    isUploading: boolean;
}

export interface ClipBoardUitlsProps {
    extractedText: string;
    setCopied: React.Dispatch<React.SetStateAction<boolean>>;
}