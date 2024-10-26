'use client';

import { useEffect, useState, useRef } from "react";
import { FileUploadArea } from "./components/FileUploadArea";
import { pageValidateFile } from "./utils/pagefilevalidation";
import { uploadFile } from "./utils/uploadFile";
import { handleCopyToClipboard } from "./utils/clipboardUtils";
import { downloadTextFile } from "./utils/downloadUtils";
import {
  UploadIcon,
  LanguageIcon,
  PrivacyIcon,
  CheckIcon,
  OpenSourceIcon,
} from "./components/icons";
import FeatureCard from "./components/FeatureCard";
import ProgressBar from "./components/ProgressBar";
import ErrorMessage from "./components/ErrorMessage";
import ExtractedTextSection from "./components/ExtractedTextSection";
import { logEvent } from "./utils/logger";
import Button from "./components/Button";
import Link from "next/link";

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
  const extractedTextRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [textFileName] = useState<string>('extracted_text');
  const [isPageValidating, setIsPageValidating] = useState<boolean>(false);
  const [conversionCompleted, setIsConversionCompleted] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [detectedLanguages, setDetectedLanguages] = useState<string[] | undefined>(undefined);

  const handleFileSelect = (file: File) => {
    setIsPageValidating(true);
    pageValidateFile(file).then((error) => {
      setIsPageValidating(false);
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
        setPageCount(undefined);
        setDetectedLanguages(undefined);
        setIsConversionCompleted(false);
      }
    });
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

    logEvent('button_click', { buttonName: 'Convert to Text', action: 'User clicked to convert the uploaded file', fileName: uploadedFileName });
    setIsConverting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uploadedFileName }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Conversion failed';
        throw new Error(errorMessage);
      }
      const result = await response.json();
      setExtractedText(result.data.text);
      setPageCount(result.data.pageCount);
      setDetectedLanguages(result.data.detectedLanguages);
      setErrorMessage('');
      setIsConversionCompleted(true);
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
    logEvent('button_click', { buttonName: 'Copy', action: 'User copied extracted text to clipboard', textLength: extractedText.length });
  };

  const handleDownload = () => {
    if (extractedText) {
      downloadTextFile({ extractedText, fileName: textFileName });
      logEvent('button_click', { buttonName: 'Download', action: 'User downloaded extracted text', textLength: extractedText.length });
    }
  };

  const handleReset = () => {
    logEvent('button_click', { buttonName: 'Upload another file', action: 'User Uploaded another File' });

    setSelectedFile(null);
    setUploadedFileName(null);
    setUploadCompleted(false);
    setUploadProgress(0);
    setExtractedText('');
    setPageCount(undefined);
    setDetectedLanguages(undefined);
    setIsConversionCompleted(false);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    logEvent('page_load', { pageName: 'Home Page', action: 'User loaded home page', });
  }, []);

  useEffect(() => {
    if (extractedText && extractedTextRef.current) {
      extractedTextRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [extractedText]);

  return (
    <div className="container mx-auto px-2 py-4">

      <section className="mb-6">
        <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-md">
          <p className="text-md">
            <strong>Cloud AI Parser</strong> allows you to effortlessly extract searchable text from images and scanned PDF documents.
            Supporting over <strong>200 languages</strong>, our tool ensures <strong>100% privacy compliance</strong>.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <FileUploadArea
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          fileInputRef={fileInputRef}
          isUploading={isUploading}
          isPageValidating={isPageValidating}
        />
        {(isUploading || (uploadCompleted && !conversionCompleted)) && (
          <div className="mt-6">
            <ProgressBar progress={uploadProgress} />
            {uploadCompleted && !conversionCompleted && (
              <div className="flex flex-col items-center">
                <div className="flex items-center text-green-600 mb-4">
                  <CheckIcon className="w-6 h-6 mr-2" />
                  <span className="text-lg font-semibold">Upload Complete</span>
                </div>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleConvert}
                  disabled={isConverting || conversionCompleted}
                  isLoading={isConverting}
                >
                  Convert to Text
                </Button>
              </div>
            )}
          </div>
        )}
        {errorMessage && <ErrorMessage message={errorMessage} />}
      </section>

      <section className="mb-8">
        {extractedText && (
          <>
            <div ref={extractedTextRef}>
              <ExtractedTextSection
                extractedText={extractedText}
                pageCount={pageCount}
                copied={copied}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
                detectedLanguages={detectedLanguages}
              />
              <div className="flex justify-center mt-4">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={handleReset}
                >
                  Upload another File
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FeatureCard
          icon={<UploadIcon className="w-12 h-12 text-blue-500 mb-2" />}
          title="Upload Files"
          description={
            <>
              Upload PDFs or images up to <strong>20 MB</strong> with a maximum of{' '}<strong>15 pages</strong>.
            </>
          }
        />
        <FeatureCard
          icon={<LanguageIcon className="w-12 h-12 text-green-500 mb-2" />}
          title="200+ Languages"
          description="Supports over 200 languages for text extraction."
        />
        <FeatureCard
          icon={<PrivacyIcon className="w-12 h-12 text-purple-500 mb-2" />}
          title="Privacy First"
          description="Files are deleted immediately after processing. Your data stays private."
        />
        <FeatureCard
          icon={<OpenSourceIcon className="w-12 h-12 text-yellow-500 mb-2" />}
          title="Open Source"
          description={
            <>
              View the project on{' '}
              <Link
                href="https://github.com/LukasTr1980/cloudai-parser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
                onClick={() => logEvent('link_click', { buttonName: 'Github Link', action: 'User clicked the Open Source Link' })}
              >
                Github.
              </Link>
            </>
          }
        />
      </section>

    </div>
  );
}