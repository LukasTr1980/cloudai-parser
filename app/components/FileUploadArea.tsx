'use client';

import { useRef } from "react";
import { FileUploadAreaProps } from "../types";

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    selectedFile,
    onFileSelect,
    errorMessage,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            onFileSelect(file);
        }
    };

    return (
        <>
            <div
                className="w-full max-w-md border-4 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer mb-4"
                onClick={handleClick}
            >
                <svg
                    className="w-12 h-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 48 48"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 16l16 16M32 16l-16 16"
                    />
                </svg>
                <p className="text-gray-600 text-lg">Click here to select a file</p>
                {selectedFile && (
                    <p className="mt-2 text-lg">
                        Selected file:{' '}
                        <span className="text-green-600 font-bold">{selectedFile.name}</span>
                    </p>
                )}
            </div>
            {errorMessage && (
                <p className="text-red-600 mt-2 mb-4 text-center" role="alert">
                    {errorMessage}
                </p>
            )}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    )
}