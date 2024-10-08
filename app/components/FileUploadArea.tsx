'use client';

import { RefObject } from "react";
import { FileUploadAreaProps } from "../types";

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    selectedFile,
    onFileSelect,
    fileInputRef,
    isUploading
}) => {

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
                className="w-full bg-gray-50 hover:bg-gray-100 max-w-5xl border-4 border-dashed border-gray-300 rounded-lg p-28 flex flex-col items-center justify-center cursor-pointer mb-4"
                onClick={!isUploading ? handleClick : undefined}
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
                        {' '}({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    )
}