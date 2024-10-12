import { CopyIcon, CheckIcon, DownloadIcon } from "./icons";
import { ExtractedTextSectionProps } from "../types";

const ExtractedTextSection: React.FC<ExtractedTextSectionProps> = ({
    extractedText,
    copied,
    handleCopy,
    handleDownload,
}) => (
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
);

export default ExtractedTextSection;

