'use client';

import { useEffect, useState, useRef } from "react";
import { FileUploadArea } from "./components/FileUploadArea";
import { validateFile } from "./utils/pagefilevalidation";
import { uploadFile } from "./components/uploadFile";

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

  const handleCopyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000)
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        })
    }
  }

  return (
    <div className="flex flex-col items-center mt-6 mx-4">
      <h1 className="text-3xl font-bold mb-6">Cloud AI Parser</h1>
      <p className="text-gray-600 text-center mb-6">
        Upload your files to extract from a PDF or an image the text.
        At the moment, a maximum file size of <span className="font-bold"> 20 MB </span> and a
        PDF with a maximum of <span className="font-bold">15 pages </span> is allowed.
      </p>

      <FileUploadArea
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
      />

      {(isUploading || uploadCompleted) && (
        <div className="flex flex-col items-center mt-6 w-full max-w-md">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          {uploadCompleted && (
            <>
              <div className="flex items-center mt-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="ml-2 text-lg text-green-600 font-semibold">
                  Upload Complete
                </span>
              </div>
              <button
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        <div className="flex items-center mt-4">
          <svg
            className="w-8 h-8 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>

          <span className="text-red-600 ml-2 text-lg font-semibold" role="alert">
            {errorMessage}
          </span>
        </div>
      )}

      {extractedText && (
        <div className="mt-6 w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <div className="relative">
            <textarea
              className="w-full h-96 p-4 border rounded overflow-y-auto"
              defaultValue={extractedText}
              spellCheck={false}
            />
            <button
              className="absolute top-2 p-1 right-8 border rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={handleCopyToClipboard}
              aria-label="Copy extracted text to clipboard"
            >
              {copied ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect x="9" y="5" width="13" height="13" rx="2" ry="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth=""
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}