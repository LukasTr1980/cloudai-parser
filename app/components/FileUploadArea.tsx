'use client';

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
                className={`w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg 
                p-8 flex flex-col items-center justify-center mb-6 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={!isUploading ? handleClick : undefined}
            >
                <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V8m0 8l5-5m-5 5l5 5m-5-5h10"
                    />
                </svg>
                <p className="text-gray-600 text-lg">Click here to select a file</p>
                {selectedFile && (
                    <p className="mt-4 text-gray-700">
                        Selected file:{' '}
                        <span className="font-semibold">{selectedFile.name}</span>
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