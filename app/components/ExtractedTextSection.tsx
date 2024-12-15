import { CopyIcon, CheckIcon, DownloadIcon, LanguageIcon } from "./Icons";
import { ExtractedTextSectionProps } from "../types";
import { useEffect, useState } from "react";

const ExtractedTextSection: React.FC<ExtractedTextSectionProps> = ({
    pages,
    selectedFileName,
    copied,
    handleCopy,
    handleDownload,
    pageCount,
    detectedLanguages,
}) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [inputValue, setInputValue] = useState<string>(String(currentPage));

    useEffect(() => {
        setInputValue(String(currentPage));
    }, [currentPage]);

    const pageToDisplay = pages.find((p) => p.pageNumber === currentPage);

    const handleNextPage = () => {
        if (pageCount && currentPage < pageCount) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const finalizePageChange = () => {
        const val = parseInt(inputValue, 10);
        if (!isNaN(val) && pageCount && val >= 1 && val <= pageCount) {
            setCurrentPage(val);
        } else {
            setInputValue(String(currentPage));
        }
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handlePageInputBlur = () => {
        finalizePageChange();
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    let confidenceText = '';
    let confidenceClass = '';
    if (pageToDisplay && typeof pageToDisplay.confidence === 'number') {
        const confidenceValue = (pageToDisplay.confidence *  100);
        confidenceText = `${confidenceValue.toFixed(0)}%`;

        if (confidenceValue > 90) {
            confidenceClass = 'text-green-600';
        } else if (confidenceValue > 60) {
            confidenceClass = 'text-yellow-600';
        } else {
            confidenceClass = 'text-red-600';
        }
    }

    return (

        <div className="bg-gray-50 rounded-xl pt-6 pb-6 mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between px-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex-1 min-w-0">
                    Extracted Text for File:{' '}
                    <span className="text-gray-900 break-all font-medium">
                        {selectedFileName}
                    </span>
                </h2>
                <div className="flex items-center space-x-3">
                    <button
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors focus:outline-none ${copied
                            ? "bg-green-100 hover:bg-green-200 text-green-600"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                            }`}
                        onClick={handleCopy}
                        aria-label="Copy text"
                    >
                        {copied ? (
                            <CheckIcon className="w-5 h-5 mr-2" />
                        ) : (
                            <CopyIcon className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-sm font-medium">
                            {copied ? 'Copied' : 'Copy'}
                        </span>
                    </button>
                    <button
                        className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors focus:outline-none"
                        onClick={handleDownload}
                        aria-label="Download text"
                    >
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Download</span>
                    </button>
                </div>
            </div>


            <div className="px-4 mb-4 mt-2">
                <div className="flex items-center space-x-6">
                    {detectedLanguages && detectedLanguages.length > 0 && (
                        <div className="flex items-center">
                            <LanguageIcon className="w-5 h-5 text-gray-600 mr-1" />
                            <span className="text-gray-600 font-medium">Detected Languages:</span>
                            <span className="ml-2 flex space-x-2">
                                {detectedLanguages.map((lang) => {
                                    const countryCode = lang.toLowerCase();
                                    if (countryCode) {
                                        return (
                                            <span
                                                key={lang}
                                                className={`fi fi-${countryCode} fis`}
                                                title={lang}
                                            ></span>
                                        );
                                    } else {
                                        return (
                                            <span key={lang} className="text-gray-800">
                                                {lang}
                                            </span>
                                        );
                                    }
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {pageCount && pageCount > 1 && (
                <div className="px-4 mb-4 flex items-center space-x-2">
                    <button
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-50"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <input
                        type="number"
                        className="w-16 text-center border border-gray-300 rounded"
                        min={1}
                        max={pageCount}
                        value={inputValue}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyDown={handlePageInputKeyDown}
                    />
                    <span>/ {pageCount}</span>
                    <button
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded disabled:opacity-50"
                        onClick={handleNextPage}
                        disabled={currentPage === pageCount}
                    >
                        Next
                    </button>
                </div>
            )}

            <div className="space-y-4 px-4">
                {pageToDisplay ? (
                    <div key={pageToDisplay.pageNumber}>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">
                            Page {pageToDisplay.pageNumber}
                            {typeof pageToDisplay.confidence === 'number' && (
                                <span className={`ml-4 text-sm font-semibold ${confidenceClass}`}>
                                    Confidence: {confidenceText}
                                </span>
                            )}
                        </h3>
                        <textarea
                            className="w-full h-72 p-4 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            value={pageToDisplay.text}
                            spellCheck={false}
                            readOnly
                        />
                    </div>
                ) : (
                    <p className="text-gray-700">No pages to display.</p>
                )}
            </div>
        </div>
    );
};

export default ExtractedTextSection;

