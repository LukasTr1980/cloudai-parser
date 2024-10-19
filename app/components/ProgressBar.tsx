import { ProgressBarProps } from "../types";
import React from "react";

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const clampedProgress = Math.round(Math.max(0, Math.min(progress, 100)) / 5) * 5;
    const progressWidthClass = `w-[${clampedProgress}%]`;

    return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 relative">
        <div
            className={`h-2.5 bg-blue-500 rounded-full transition-all duration-300 ${progressWidthClass}`}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
            {clampedProgress}%
        </span>
    </div>
    );
};

export default ProgressBar;