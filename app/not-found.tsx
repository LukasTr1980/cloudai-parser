'use client';

import Link from "next/link";
import { logEvent } from "./utils/logger";
import { useEffect } from "react";

export default function NotFound() {
    useEffect(() => {
        logEvent('page_load', { pageName: 'Not Found', action: 'User opened Not found Page.' });
    })

    return (
        <div className="text-center p-8 bg-white">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">404</h2>
            <p className="text-lg text-gray-600 mb-6">
                Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link 
            href="/"
            className="text-blue-500 underline"
            onClick={() => logEvent('link_click', { buttonName: 'Return Home', action: 'User clicked the Return Home Link in 404 not found page.' })}
            >
                Return Home
            </Link>
        </div>
    );
}