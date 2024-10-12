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
  DownloadIcon,
  OpenSourceIcon,
} from "./components/icons";
import Spinner from "./components/spinner";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [textFileName, setTextFileName] = useState<string>('extracted_text');

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setUploadCompleted(false);
      setUploadedFileName(null);
      setSelectedFile(null);
    } else {
      setErrorMessage('');
      setUploadCompleted(false);
      setUploadProgress(0);
      setUploadedFileName(null);
      setSelectedFile(file);
      setExtractedText('');
    }
  };

  useEffect(() => {
    if (selectedFile) {
      uploadFileAsync(selectedFile);
    }
  }, [selectedFile]);

  const uploadFileAsync = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setUploadedFileName(response.fileName);
      setUploadCompleted(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred during upload.');
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

  const handleConvert = async () => {
    if (!uploadedFileName || !uploadCompleted) {
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
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Cloud AI Parser</h1>
        <p className="text-lg text-gray-600">
          Extract text from PDFs and images using the power of AI.
        </p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-lg">
          <UploadIcon className="w-12 h-12 text-blue-500 mb-2" />
          <h3 className="text-xl font-semibold mb-1">Upload Files</h3>
          <p className="text-center text-gray-600">
            Upload PDFs or images up to <strong>20 MB</strong> with a maximum of{' '}
            <strong>15 pages</strong>.
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-lg">
          <LanguageIcon className="w-12 h-12 text-green-500 mb-2" />
          <h3 className="text-xl font-semibold mb-1">200+ Languages</h3>
          <p className="text-center text-gray-600">Supports over 200 languages for text extraction.</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-lg">
          <PrivacyIcon className="w-12 h-12 text-purple-500 mb-2" />
          <h3 className="text-xl font-semibold mb-1">Privacy First</h3>
          <p className="text-center text-gray-600">
            Files are deleted immediately after processing. Your data stays private.
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-lg">
          <OpenSourceIcon className="w-12 h-12 text-yellow-500 mb-2" />
          <h3 className="text-xl font-semibold mb-1">Open Source</h3>
          <p className="text-center text-gray-500">
            View the project on{' '}
            <a
              href="https://github.com/LukasTr1980/cloudai-parser"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline">
              Github
            </a>.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <FileUploadArea
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
        />
        {(isUploading || uploadCompleted) && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 relative">
              <div
                className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
                {uploadProgress}%
              </span>
            </div>
            {uploadCompleted && (
              <div className="flex flex-col items-center">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckIcon className="w-6 h-6 mr-2" />
                  <span className="text-lg font-semibold">Upload Complete</span>
                </div>
                <button
                  className="relative px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                            disabled:bg-gray-400 "
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  <span className={isConverting ? 'invisible' : ''}>Convert to text</span>
                  {isConverting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:{' '}</strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
      </section>

      <section className="mb-8">
        {extractedText && (
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Extracted Text:</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleCopy}
                  aria-label="Copy text"
                >
                  {copied ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mr-1" />
                  ) : (
                    <CopyIcon className="w-5 h-5 text-gray-600 mr-1" />
                  )}
                  <span className="text-sm">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>
                <button
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleDownload}
                  aria-label="Download text"
                >
                  <DownloadIcon className="w-5 h-5 text-gray-600 mr-1" />
                  <span className="text-sm">Download</span>
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={extractedText}
              spellCheck={false}
              readOnly
            />
          </div>
        )}
      </section>
    </div>
  );
}