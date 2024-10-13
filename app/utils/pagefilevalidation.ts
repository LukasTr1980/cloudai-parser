'use client';

import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from "./constants";
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';

export const getFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLocaleLowerCase();
    return extension ? '.' + extension : '';
};

export const pageValidateFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
        const fileExtension = getFileExtension(file.name);
        if (
            !ALLOWED_EXTENSIONS.includes(fileExtension) ||
            !ALLOWED_MIME_TYPES.includes(file.type)
        ) {
            resolve('Invalid file type. Only images and PDFs are allowed.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            resolve(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`)
            return;
        }

        if (fileExtension === '.pdf') {
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs';
            }

            file.arrayBuffer().then(arrayBuffer => {
                const typedArray = new Uint8Array(arrayBuffer);
                const loadingTask = pdfjsLib.getDocument(typedArray);
                loadingTask.promise.then(pdfDocument => {
                    const numPages = pdfDocument.numPages;

                    if (numPages > 15) {
                        resolve('PDF file exceeds the maximum allowed 15 pages.');
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