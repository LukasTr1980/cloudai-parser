'use client';

import { useEffect, useState, useRef } from "react";
import { FileUploadArea } from "./components/FileUploadArea";
import { validateFile } from "./utils/pagefilevalidation";
import { uploadFile } from "./components/uploadFile";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [uploadCompleted, setUploadCompleted] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSuccessMessage('');
      setUploadCompleted(false);
      setSelectedFile(null);
    } else {
      setErrorMessage('');
      setSuccessMessage('');
      setUploadCompleted(false);
      setUploadProgress(0);
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      const upload = async () => {
        setIsUploading(true);
        try {
          await uploadFile(selectedFile, (progress) => {
            setUploadProgress(progress);
          });
          setSuccessMessage('File uploaded successfully');
          setUploadCompleted(true);
        } catch (error: any) {
          setErrorMessage(error?.message || 'An error occurred during upload.');
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

  return (
    <div className="flex flex-col items-center mt-6 mx-4">
      <h1 className="text-3xl font-bold mb-6">Cloud AI Parser</h1>

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
          )}
        </div>
      )}
      {errorMessage && (
        <p className="text-red-600 ml-2 text-lg font-semibold" role="alert">
          {errorMessage} Please select a valid file.
        </p>
      )}
    </div>
  );
}