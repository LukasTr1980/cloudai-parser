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
    <div className="flex flex-col items-center mt-2 ml-2 mr-2">
      <h1 className="text-2xl font-bold mb-2">Cloud AI Parser</h1>

      <FileUploadArea
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
      />

      {(isUploading || uploadCompleted) && (
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-4 bg-gray-200 rounded">
            <div
              className="absolute left-0 top-0 h-4 bg-blue-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="mt-2 text-gray-700">
            {isUploading
              ? `Uploading... ${uploadProgress.toFixed(2)}%`
              : `Upload completed: ${uploadProgress.toFixed(2)}%`
            }
          </span>
        </div>
      )}
      {successMessage && (
        <p className="text-green-600 mt-2 mb-4 text-center" role="status">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="text-red-600 mt-2 mb-4 text-center" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}