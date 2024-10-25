import React from "react";

import { ButtonProps } from "../types";
import Spinner from "./spinner";

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    isLoading = false,
    variant = 'primary',
    size = 'medium',
    className = '',
    ...rest
}) => {
    const baseStyles = 
    'relative px-6 py-2 rounded-full text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    };

    const sizes = {
        small: 'text-sm px-4 py-2',
        medium: 'text-base px-6 py-2',
        large: 'text-lg px-8 py-3',
    }

    const disabledStyles = disabled || isLoading ? 'bg-gray-400 cursor-not-allowed' : '';

    const buttonClasses = `${baseStyles} ${sizes[size]} ${disabled || isLoading ? disabledStyles : variants[variant]} ${className}`;

    return (
        <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={buttonClasses}
        {...rest}
        >
            <span className={isLoading ? 'invisible' : ''}>{children}</span>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="w-5 h-5" />
                </div>
            )}
        </button>
    );
};

export default Button;