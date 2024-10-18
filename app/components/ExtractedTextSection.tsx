import { CopyIcon, CheckIcon, DownloadIcon } from "./icons";
import { ExtractedTextSectionProps } from "../types";

const ExtractedTextSection: React.FC<ExtractedTextSectionProps> = ({
    extractedText,
    copied,
    handleCopy,
    handleDownload,
}) => (
    <div className="bg-gray-50 shadow-lg rounded-xl p-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Extracted Text:</h2>
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
        <textarea
            className="w-full h-72 p-4 text-gray-800 bg-white border border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={extractedText}
            spellCheck={false}
            readOnly
        />
    </div>
);

export default ExtractedTextSection;

