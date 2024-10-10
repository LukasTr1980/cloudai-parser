'use client';

import { FileUploadAreaProps } from "../types";
import React, { useState } from "react";

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    selectedFile,
    onFileSelect,
    fileInputRef,
    isUploading
}) => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [, setDragCounter] = useState<number>(0);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            onFileSelect(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUploading) {
            setDragCounter(prevCounter => {
                const newCounter = prevCounter + 1;
                if (newCounter > 0) {
                    setIsDragOver(true);
                }
                return newCounter;
            })
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prevCounter => {
            const newCounter = prevCounter - 1;
            if (newCounter === 0) {
                setIsDragOver(false);
            }
            return newCounter;
        })
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        setDragCounter(0);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0]
            onFileSelect(file);
            e.dataTransfer.clearData();
        }
    };

    return (
        <>
            <div
                className={`w-full max-w-md bg-white border-2 border-dashed border-gray-300 rounded-lg 
                    p-8 flex flex-col items-center justify-center mb-6 cursor-pointer transition-all duration-200 
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    ${isDragOver ? 'bg-gray-100 border-blue-400' : ''}`}
                onClick={!isUploading ? handleClick : undefined}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={!isUploading ? handleDrop : undefined}
            >
                <svg
                    className={`w-12 h-12 mb-4 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`}
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
                {isDragOver ? (
                    <p className="text-blue-600 text-lg">Release to upload your file</p>
                ) : (
                    <p className="text-gray-600 text-lg">Click or drag file to this area to upload</p>
                )}
                {selectedFile && (
                    <p className="mt-4 text-gray-700 text-center">
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