import { ReactNode, RefObject } from "react";

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
    isPageValidating: boolean;
}

export interface ClipBoardUitlsProps {
    extractedText: string;
    setCopied: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: React.ReactNode;
}

export interface ProgressBarProps {
    progress: number;
}

export interface ErrorMessageProps {
    message: string;
}

export interface ExtractedTextSectionProps {
    extractedText: string;
    copied: boolean;
    handleCopy: () => void;
    handleDownload: () => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
}