import { CopyIcon, CheckIcon, DownloadIcon, LanguageIcon } from "./Icons";
import { ExtractedTextSectionProps } from "../types";

const ExtractedTextSection: React.FC<ExtractedTextSectionProps> = ({
    extractedText,
    selectedFileName,
    copied,
    handleCopy,
    handleDownload,
    pageCount,
    detectedLanguages,
}) => (
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


        <div className="px-4 mb-6">
            <div className="flex items-center space-x-6">
                {pageCount !== undefined && (
                    <div className="flex items-center">
                        <span className="text-gray-600 font-medium">Page Count:</span>
                        <span className="ml-2 text-gray-800">{pageCount}</span>
                    </div>
                )}
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

        <textarea
            className="w-full h-72 p-4 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={extractedText}
            spellCheck={false}
            readOnly
        />
    </div>
);

export default ExtractedTextSection;

