'use client';

import { FileUploadAreaProps } from "../types";
import React, { useState } from "react";
import { CheckIcon, DeleteIcon, IMGIcon, PDFIcon } from './Icons'
import Spinner from "./Spinner";
import { truncateFileName } from "../utils/stringUtils";
import { logEvent } from "../utils/logger";
import Button from "./Button";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    selectedFile,
    selectedFileName,
    selectedFileSize,
    isFileChecking,
    isFileDeleted,
    onFileSelect,
    onFileDelete,
    fileInputRef,
    isUploading,
    isPageValidating,
    isConverting,
}) => {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [, setDragCounter] = useState<number>(0);
    const displayFileName = selectedFile?.name || selectedFileName || '';
    const displayFileSize = selectedFile?.size || selectedFileSize || null;
    const { data: session, status } = useSession();
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
        if (!isUploading && !isPageValidating && !isFileChecking) {
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

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileDelete();
    };

    return (
        <>
            {status === 'loading' && (
                <div className="flex w-full h-32 items-center justify-center">
                    <Spinner className="w-12 h-12" />
                </div>
            )}
            {status !== 'loading' && !session?.user && (
                <div className="flex flex-col p-4 bg-violet-100 border border-gray-300 shadow-md rounded-md mb-6 text-center min-h-32">
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg text-violet-600 mb-2 font-semibold">
                            Want more for free? 30 Pages, 40 MB
                        </p>
                        <Link
                            href="/signin"
                            className="inline-block px-6 py-2 border border-transparent text-base font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            onClick={() =>
                                logEvent('link_click', {
                                    buttonName: 'Sign In',
                                    action: 'User clicked the Sign In link',
                                })
                            }
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
            <div
                className={`relative w-full bg-white border-2 border-dashed border-blue-400 rounded-lg 
                    p-6 flex flex-col items-center justify-center mb-4 transition-all duration-200 
                    ${isDragOver ? '!bg-gray-50' : 'bg-white'}
                    ${isUploading || isPageValidating || isFileChecking || isConverting
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-50'}`}
                onClick={(!isUploading && !isPageValidating && !isConverting) || isFileChecking ? handleClick : undefined}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(!isUploading && !isPageValidating && !isConverting) || isFileChecking ? handleDrop : undefined}
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
                {!isFileDeleted ? (
                    (selectedFile || displayFileName || displayFileSize !== null) && (
                        <p className="mt-4 text-gray-700 text-center">
                            Selected file:{' '}
                            <span className="font-semibold break-all">
                                {truncateFileName(displayFileName, 50)}
                            </span>
                            {' '}
                            {displayFileSize !== null && `(${(displayFileSize / (1024 * 1024)).toFixed(2)} MB)`}
                        </p>
                    )
                ) : (
                    <p className="flex items-center mt-4 text-gray-700 text-center">
                        <CheckIcon className="w-6 h-6 mr-2" />
                        <span className="font-semibold text-lg">File removed from Server</span>
                    </p>
                )}
                {!isFileDeleted && (selectedFile || displayFileName) && (
                    <div className="absolute top-2 right-2">
                        <Button
                            onClick={handleDelete}
                            className="p-2"
                            disabled={isConverting || isUploading}
                            variant="danger"
                            size="small"
                        >
                            <DeleteIcon className="w-6 h-6" />
                        </Button>
                    </div>
                )}
                {isPageValidating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
                        <p className="text-xl font-semibold mb-4">Preprocessing File</p>
                        <Spinner className="w-16 h-16" />
                    </div>
                )}
                {isFileChecking && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
                        <p className="text-xl font-semibold mb-4">Preparing...</p>
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