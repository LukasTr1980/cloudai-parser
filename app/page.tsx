'use client';

import { useEffect, useState, useRef } from "react";
import { FileUploadArea } from "./components/FileUploadArea";
import { validateFile } from "./utils/pagefilevalidation";
import { uploadFile } from "./utils/uploadFile";
import { handleCopyToClipboard } from "./utils/clipboardUtils";
import { downloadTextFile } from "./utils/downloadUtils";
import {
  UploadIcon,
  LanguageIcon,
  PrivacyIcon,
  CopyIcon,
  CheckIcon,
  ErrorIcon,
  DownloadIcon
} from "./components/icons";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setSuccessMessage] = useState<string>('');
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [textFileName, setTextFileName] = useState<string>('extracted_text');

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSuccessMessage('');
      setUploadCompleted(false);
      setUploadedFileName(null);
      setSelectedFile(null);
    } else {
      setErrorMessage('');
      setSuccessMessage('');
      setUploadCompleted(false);
      setUploadProgress(0);
      setUploadedFileName(null);
      setSelectedFile(file);
      setExtractedText('');
    }
  };

  useEffect(() => {
    if (selectedFile) {
      const upload = async () => {
        setIsUploading(true);
        try {
          const response = await uploadFile(selectedFile, (progress) => {
            setUploadProgress(progress);
          });
          setSuccessMessage('File uploaded successfully');
          setUploadedFileName(response.fileName);
          setUploadCompleted(true);
        } catch (error: unknown) {
          if (error instanceof Error) {
            setErrorMessage(error?.message || 'An error occurred during upload.');
          } else {
            setErrorMessage('An unknown error occurred during upload.');
          }
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      upload();
    }
  }, [selectedFile]);

  const handleConvert = async () => {
    if (!uploadedFileName) {
      setErrorMessage('No file to convert');
      return;
    }
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uploadedFileName }),
      });
      if (!response.ok) {
        throw new Error('Conversion failed');
      }
      const result = await response.json();
      setExtractedText(result.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred during conversion.');
      }
    } finally {
      setIsConverting(false);
    }
  }

  const handleCopy = () => {
    handleCopyToClipboard({ extractedText, setCopied });
  };

  const handleDownload = () => {
    if (extractedText) {
      downloadTextFile({ extractedText, fileName: textFileName });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Cloud AI Parser</h1>
      <div className="text-gray-600 text-left mb-6 border border-gray-300 p-2">
        <p className="mb-1 inline-flex items-center">
          <UploadIcon className="min-w-14 min-h-14 w-14 h-14 mr-2" />
          <span>
            Upload your files to extract text from a PDF or image. Currently, a maximum file size of
            <span className="font-bold"> 20 MB</span> is allowed, and PDFs can contain up to <span className="font-bold">15 pages</span>.
          </span>
        </p>
        <p className="mb-1 inline-flex items-center">
          <LanguageIcon className="min-w-14 min-h-14 w-14 h-14 mr-2" />
          <span>
            Over <b>200</b> languages are supported.
          </span>
        </p>
        <p className="mb-1 inline-flex items-center">
          <PrivacyIcon className="min-w-14 min-h-14 w-14 h-14 mr-2" />
          <span>
            To ensure your <b>Privacy</b>, files are deleted
            immediately after the operation is completed. In the unlikely event that an error prevents file deletion, the file will remain on
            the server for a maximum of <b>24 hours</b>. A deletion procedure will remove it then. All files are <b>encrypted</b>, so no one will have access to them.
          </span>
        </p>
      </div>
      <FileUploadArea
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
      />

      {(isUploading || uploadCompleted) && (
        <div className="flex flex-col items-center mt-4 w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          {uploadCompleted && (
            <>
              <div className="flex items-center mt-4">
                <CheckIcon className="w-8 h-8 min-w-8 min-h-8 text-green-500" />
                <span className="ml-2 text-lg text-green-600 font-semibold">
                  Upload Complete
                </span>
              </div>
              <button
                className="mt-4 px-6 py-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleConvert}
                disabled={isConverting}
              >
                {isConverting ? 'Converting...' : 'Convert to Text'}
              </button>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center mt-2">
          <ErrorIcon className="w-8 h-8 min-w-8 min-h-8" />
          <span className="text-red-600 ml-2 text-lg text-center font-semibold" role="alert">
            {errorMessage}
          </span>
        </div>
      )}

      {extractedText && (
        <div className="mt-6 w-full max-w-6xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="ml-2 text-xl text-gray-600 font-semibold">Extracted Text:</h2>
            <div className="flex items-center space-x-2 mr-2">
              <button
                className="p-1 border rounded-lg text-gray-600 hover:bg-gray-50"
                onClick={handleCopy}
                aria-label="Copy extracted text to clipboard"
              >
                {copied ? (
                  <CheckIcon className="w-6 h-6 min-w-6 min-h-6" />
                ) : (
                  <CopyIcon className="w-6 h-6 min-w-6 min-h-6" />
                )}
              </button>
              <button
                className="p-1 border rounded-lg text-gray-600 hover:bg-gray-50"
                onClick={handleDownload}
                aria-label="Download extracted Text as .txt file"
              >
                <DownloadIcon className="w-6 h-6 min-w-6 min-h-6" />
              </button>
            </div>
          </div>
          <textarea
            className="w-full h-96 p-4 border rounded overflow-y-auto"
            defaultValue={extractedText}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}