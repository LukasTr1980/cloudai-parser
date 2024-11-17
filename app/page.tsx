'use client';

import { useEffect, useState, useRef, useCallback } from "react";
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
} from "./components/Icons";
import FeatureCard from "./components/FeatureCard";
import ProgressBar from "./components/ProgressBar";
import ErrorMessage from "./components/ErrorMessage";
import ExtractedTextSection from "./components/ExtractedTextSection";
import { logEvent } from "./utils/logger";
import Button from "./components/Button";
import Link from "next/link";
import sanitize from "sanitize-html";
import { supportedLanguages } from "./utils/constants";
import { useSession } from "next-auth/react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
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
  const [, setFileExists] = useState<boolean | undefined>(undefined);
  const [isFileChecking, setIsFileChecking] = useState<boolean>(false);
  const [isFileDeleted, setIsFileDeleted] = useState<boolean>(false);
  const supportedLanguagesRef = useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (file: File) => {
    setIsPageValidating(true);
    pageValidateFile(file, status).then((error) => {
      setIsPageValidating(false);
      if (error) {
        setErrorMessage(error);
        setUploadCompleted(false);
        setUploadedFileName(null);
        setSelectedFile(null);
        setSelectedFileName(null);
        setSelectedFileSize(null);
        setIsFileDeleted(false);
      } else {
        const sanitizedFileName = sanitize(file.name);
        setErrorMessage('');
        setUploadCompleted(false);
        setUploadProgress(0);
        setUploadedFileName(null);
        setSelectedFile(file);
        setSelectedFileName(sanitizedFileName);
        setSelectedFileSize(file.size);
        setExtractedText('');
        setPageCount(undefined);
        setDetectedLanguages(undefined);
        setIsConversionCompleted(false);
        setIsFileDeleted(false);
      }
    });
  };

  const uploadFileAsync = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const apiRoute = status === 'authenticated' ? '/api/plus-upload' : '/api/upload';
        const response = await uploadFile(file, apiRoute, (progress) => {
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
    },
    [
      status,
      setIsUploading,
      setErrorMessage,
      setUploadedFileName,
      setUploadCompleted,
      fileInputRef,
      setUploadProgress,
    ]
  );

  useEffect(() => {
    if (selectedFile && status !== 'loading') {
      uploadFileAsync(selectedFile);
    }
  }, [selectedFile, status, uploadFileAsync]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleConvert = async () => {
    if (!uploadedFileName || !uploadCompleted) {
      setErrorMessage('No file to convert');
      return;
    }

    logEvent('button_click', { buttonName: 'Convert to Text', action: 'User clicked to convert the uploaded file', fileName: uploadedFileName });
    setIsConverting(true);
    try {
      const apiRoute = status === 'authenticated' ? '/api/plus-convert' : '/api/convert';
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: uploadedFileName }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Conversion failed';
        setIsFileDeleted(true);
        throw new Error(errorMessage);
      }
      const result = await response.json();

      if (status === 'authenticated') {
        const operationName = result.operationName;
        if (!operationName) {
          throw new Error('Operation name not retrieved');
        }
        setIsPolling(true);
        startPolling(operationName);
      } else {

        setExtractedText(result.data.text);
        setPageCount(result.data.pageCount);
        setDetectedLanguages(result.data.detectedLanguages);
        setErrorMessage('');
        setIsConversionCompleted(true);
        setFileExists(false);
        setIsFileDeleted(true);
        setIsConverting(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        setIsConverting(false);
      } else {
        setErrorMessage('An unknown error occurred during conversion.');
        setIsConverting(false);
      }
    }
  }

  const startPolling = (operationName: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/plus-convert-status?operationName=${encodeURIComponent(operationName)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Token': window.API_TOKEN,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          const errorMessage = errorResponse.message || 'Error checking operation status';
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (response.status === 200) {
          setIsConverting(false);
          setExtractedText(result.data.text);
          setPageCount(result.data.pageCount);
          setDetectedLanguages(result.data.detectedLanguages);
          setErrorMessage('');
          setIsConversionCompleted(true);
          setFileExists(false);
          setIsFileDeleted(true);
          setIsPolling(false);
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
        } else if (response.status === 202) {
        } else {
          throw new Error(result.message || 'Unexpected status code from status endpoint');
        }

      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
          setIsConverting(false);
        } else {
          setErrorMessage('An unkown Error occurred during polling.');
          setIsConverting(false);
        }
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }, 5000);
  };

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

  const checkForOngoingOperation = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const response = await fetch('/api/plus-get-ongoing-operation', {
        method: 'GET',
        headers: {
          'X-Api-Token': window.API_TOKEN,
        },
        credentials: 'include'
      });

      if (response.status === 200) {
        const data = await response.json();
        const { operationName, fileName } = data.ongoingOperation;
        if (operationName && fileName) {
          setUploadedFileName(fileName);
          setIsPolling(true);
          setIsConverting(true);
          startPolling(operationName);
        } else {
          setUploadedFileName(null);
          setIsPolling(false);
          setIsConverting(false);
        }
      } else if (response.status === 204) {
        setUploadedFileName(null);
        setIsPolling(false);
        setIsConverting(false);
      } else {
        setUploadedFileName(null);
        setIsPolling(false);
        setIsConverting(false);
        throw new Error('Failed to retrieve ongoing operation');
      }
    } catch (error) {
      setUploadedFileName(null);
      setIsPolling(false);
      setIsConverting(false);
      logEvent('Error', { errorMessage: error || 'Failed to check for ongoing operations.' });
      setErrorMessage('Error checking for ongoing operation');
    }
  }, [status]);

  const clearOngoingOperation = async () => {
    try {
      await fetch('/api/plus-clear-ongoing-operation', {
        method: 'POST',
        headers: {
          'X-Api-Token': window.API_TOKEN,
        },
        credentials: 'include',
      });
    } catch (error) {
      logEvent('Error', { errorMessage: error || 'Failed to reset clearOngoingOperation.' });
    }
  }

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
    setFileExists(false);
    setIsFileDeleted(false);
    setSelectedFileSize(null);
    setSelectedFileName(null);
    setErrorMessage('');
    setIsPolling(false);
    if (status === 'authenticated') {
      clearOngoingOperation();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
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

  useEffect(() => {
    const checkFileExistence = async () => {
      if (status === 'loading') return;

      setIsFileChecking(true);
      try {
        const apiRoute = status === 'authenticated' ? '/api/plus-check-file' : '/api/check-file';
        const response = await fetch(apiRoute, {
          method: 'GET',
          headers: {
            'X-Api-Token': window.API_TOKEN,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setFileExists(data.exists);

          if (data.exists) {
            setUploadCompleted(true);
            setUploadProgress(100);
            setErrorMessage('');
            setUploadedFileName(data.uniqueName);
            setSelectedFileName(data.originalName);
            setSelectedFileSize(data.fileSize);
          } else {
            setFileExists(false);
          }
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || 'Failed to check file existence.');
          logEvent('Error', { errorMessage: errorData.message || 'Failed to check file existence.' });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message || 'An error occurred while checking file existence.');
          logEvent('Error', { errorMessage: error.message || 'An error occurred while checking file existence.' });
        } else {
          setErrorMessage('An unknown error occurred while checking file existence.');
          logEvent('Error', { errorMessage: 'An unknown error occurred while checking file existence.' });
        }
      } finally {
        setIsFileChecking(false);
      }
    };

    checkFileExistence();
  }, [status]);

  const handleFileDelete = async () => {
    try {
      const apiRoute = status === 'authenticated' ? '/api/plus-delete-file' : '/api/delete-file';
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'X-Api-Token': window.API_TOKEN,
        },
        credentials: 'include',
      });
      if (response.ok) {
        logEvent('button_click', { buttonName: 'Delete Icon', action: 'User clicked Delete Icon' });
        setSelectedFile(null);
        setSelectedFileName(null);
        setSelectedFileSize(null);
        setUploadCompleted(false);
        setUploadProgress(0);
        setErrorMessage('');
        setIsFileDeleted(true);
      } else {
        logEvent('Error', { errorMessage: 'Failed to delete file' });
      }
    } catch (error) {
      logEvent('Error', { errorMessage: error });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      checkForOngoingOperation();
    }
  }, [status, checkForOngoingOperation]);

  const handleScrollToLanguages = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    event.preventDefault();
    logEvent('link_click', {
      buttonName: 'Supported Languages More Link',
      action: 'User clicked to view supported languages',
    });
    if (supportedLanguagesRef.current) {
      supportedLanguagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

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
          isConverting={isConverting}
          selectedFile={selectedFile}
          selectedFileName={selectedFileName}
          selectedFileSize={selectedFileSize}
          isFileChecking={isFileChecking}
          isFileDeleted={isFileDeleted}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
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
                  disabled={isConverting || conversionCompleted || isPolling}
                  isLoading={isConverting}
                >
                  Convert to Text
                </Button>
              </div>
            )}
          </div>
        )}
        {isPolling && (
          <div className="flex flex-col items-center mt-4">
            <div className="flex items-center text-blue-600 mb-4">
              <span className="text-lg font-semibold">
                Processing your document... This may take several minutes.
              </span>
            </div>
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
                selectedFileName={selectedFileName}
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
        {status !== 'loading' && (
          <>
            <FeatureCard
              icon={<UploadIcon className="w-12 h-12 text-blue-500 mb-2" />}
              title="Upload Files"
              description={
                <>
                  {status === 'unauthenticated'
                    ? (
                      <>
                        Upload PDFs or images up to <strong>20 MB</strong> with a maximum of{' '}<strong>15 pages</strong>.
                      </>
                    ) : (
                      <>
                        Upload PDFs or images up to <strong>40 MB</strong> with a maximum of{' '}<strong>30 pages</strong>.
                      </>
                    )
                  }
                </>
              }
            />
            <FeatureCard
              icon={<LanguageIcon className="w-12 h-12 text-green-500 mb-2" />}
              title="200+ Languages"
              description={
                <>
                  Supports over 200 languages for text extraction.{' '}
                  <button className="text-blue-500 underline" onClick={handleScrollToLanguages}>
                    More
                  </button>
                </>
              }
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
          </>
        )}
      </section>

      <section id="supported-languages" className="mb-8">
        <div ref={supportedLanguagesRef} className="bg-white border border-gray-300 rounded-md p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Supported Languages</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {supportedLanguages.map((language) => (
                <div key={language} className="text-md text-gray-800 border border-gray-300 rounded-md p-2 text-center">
                  {language}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}