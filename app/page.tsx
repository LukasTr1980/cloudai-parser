'use client';

import { useState } from "react";
import { FileUploadArea } from "./components/FileUploadArea";
import { validateFile } from "./utils/pagefilevalidation";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSelectedFile(null);
    } else {
      setErrorMessage('');
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadStatus('Uploading...');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
        setSelectedFile(null);
        setErrorMessage('');
      } else {
        const result = await response.json().catch(() => null);
        const errorMessage = result?.message || `Upload failed due to server error.`;
        setUploadStatus(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('An error occurred during upload.')
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Upload a File</h1>

      <FileUploadArea
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        errorMessage={errorMessage}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!selectedFile}
      >
        Upload
      </button>
      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  )
}