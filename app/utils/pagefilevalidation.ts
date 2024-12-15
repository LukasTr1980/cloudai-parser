'use client';

import { MAX_FILE_SIZE, PLUS_MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "./constants";
import * as pdfjsLib from 'pdfjs-dist';
import { logEvent } from "./logger";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://charts.cx/cdn/4.9.155/pdf.worker.min.mjs';

export const getFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLocaleLowerCase();
    return extension ? '.' + extension : '';
};

export const pageValidateFile = (
    file: File,
    status: 'authenticated' | 'unauthenticated' | 'loading'
): Promise<string | null> => {
    return new Promise((resolve) => {
        let maxNumPages: number;
        let numMaxSize: number;

        if (status === 'authenticated') {
            maxNumPages = 30;
            numMaxSize = PLUS_MAX_FILE_SIZE;
        } else {
            maxNumPages = 15;
            numMaxSize = MAX_FILE_SIZE;
        }

        const fileExtension = getFileExtension(file.name);
        if (
            !ALLOWED_EXTENSIONS.includes(fileExtension) ||
            !ALLOWED_MIME_TYPES.includes(file.type)
        ) {
            resolve('Invalid file type. Only images and PDFs are allowed.');
            logEvent('Error', { errorMessage: 'Invalid file type', action: 'User tried to upload an infalid filetype.', fileType: file.type });
            return;
        }
        if (file.size > numMaxSize) {
            resolve(`File size exceeds the maximum limit of ${numMaxSize / (1024 * 1024)} MB`)
            logEvent('Error',
                {
                    errorMessage: 'File exceeds the maximum size',
                    action: 'User tried to upload a bigger file then allowed.',
                    fileSizeMB: (file.size / (1024 * 1024)).toFixed(2)
                });
            return;
        }

        if (fileExtension === '.pdf') {
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://charts.cx/cdn/4.9.155/pdf.worker.min.mjs';
            }

            file.arrayBuffer().then(arrayBuffer => {
                const typedArray = new Uint8Array(arrayBuffer);
                const loadingTask = pdfjsLib.getDocument(typedArray);
                loadingTask.promise.then(pdfDocument => {
                    const numPages = pdfDocument.numPages;

                    if (numPages > maxNumPages) {
                        resolve(`PDF file exceeds the maximum allowed ${maxNumPages} pages.`);
                        logEvent('Error', {
                            errorMessage: 'File exceeds the maximum pages',
                            action: `User tried to upload a file that has more then ${maxNumPages} pages.`,
                            numPages: numPages,
                        })
                    } else {
                        resolve(null);
                    }
                }).catch(error => {
                    console.error('Error loading PDF document:', error);
                    resolve('Failed to read the PDF file.');
                });
            }).catch(error => {
                console.error('Error reading file array buffer:', error);
                resolve('Failed to read the PDF file.');
            });
        } else {
            resolve(null);
        }
    })
};