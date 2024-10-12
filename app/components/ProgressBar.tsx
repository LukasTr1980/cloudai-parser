import { ProgressBarProps } from "../types";

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 relative">
        <div
            className="h-2.5 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
            {progress}%
        </span>
    </div>
);

export default ProgressBar;