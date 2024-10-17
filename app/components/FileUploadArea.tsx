'use client';

import { FileUploadAreaProps } from "../types";
import React, { useState } from "react";
import { IMGIcon, PDFIcon } from "./icons";
import Spinner from "./spinner";
import { truncateFileName } from "../utils/stringUtils";
import { logEvent } from "../utils/logger";

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    selectedFile,
    onFileSelect,
    fileInputRef,
    isUploading,
    isPageValidating,
}) => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [, setDragCounter] = useState<number>(0);

    const handleClick = () => {
        logEvent('file_upload_click', { action: 'User clicked to select a file' });
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            logEvent('file_selected', {
                action: 'User selected a file via file input',
                fileType: file.type,
                fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
            })

            onFileSelect(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUploading && !isPageValidating) {
            setDragCounter(prevCounter => {
                const newCounter = prevCounter + 1;
                if (newCounter > 0) {
                    setIsDragOver(true);
                    
                    logEvent('drag_enter', { action: 'User started dragging a file over the upload area' });
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

                logEvent('drag_leave', { action: 'User dragged a file away from the upload area' });
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
            const file = e.dataTransfer.files[0];

            logEvent('file_dropped', {
                action: 'User dropped a file into the upload area',
                fileType: file.type,
                fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
            });

            onFileSelect(file);
            e.dataTransfer.clearData();
        }
    };

    return (
        <>
            <div
                className={`relative w-full bg-white border-2 border-dashed border-blue-400 rounded-lg 
                    p-6 flex flex-col items-center justify-center mb-4 cursor-pointer transition-all duration-200 
                    ${isUploading || isPageValidating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    ${isDragOver ? 'bg-gray-50' : ''}`}
                onClick={!isUploading && !isPageValidating ? handleClick : undefined}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={!isUploading && !isPageValidating ? handleDrop : undefined}
            >
                <div className="flex items-center justify-between space-x-8 mb-4">
                    <PDFIcon
                        className={`min-w-16 min-h-16 w-16 h-16 ${isDragOver ? 'text-blue-400' : 'text-gray-600'}`}
                    />
                    <IMGIcon
                        className={`min-w-14 min-h-14 w-14 h-14 ${isDragOver ? 'text-blue-400' : 'text-gray-600'}`}
                    />
                </div>
                {isDragOver ? (
                    <p className="text-blue-600 text-center text-lg">Release to upload your file</p>
                ) : (
                    <p className="text-gray-600 text-center text-lg">Click or drag file to this area to upload</p>
                )}
                {selectedFile && (
                    <p className="mt-4 text-gray-700 text-center">
                        Selected file:{' '}
                        <span className="font-semibold break-all">
                            {truncateFileName(selectedFile.name, 50)}
                        </span>
                        {' '}({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                )}
                {isPageValidating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
                        <p className="text-xl font-semibold mb-4">Preprocessing File</p>
                        <Spinner className="w-16 h-16" />
                    </div>
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