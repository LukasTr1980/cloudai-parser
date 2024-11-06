"use client";

import { signIn } from "next-auth/react";
import { providerMap } from "../utils/providers";
import { GoogleIcon } from "../components/Icons";
import { useEffect, useState } from "react";
import { logEvent } from "../utils/logger";

export default function SignInPage() {
    const [email, setEmail] = useState("");

    const handleSignIn = (providerId: string) => {
        logEvent('button_click', { provider: providerId, action: `User signed in with ${providerId}` });
        if (providerId === 'nodemailer') {
            signIn("nodemailer", { email, callbackUrl: "/" });
        } else {
            signIn(providerId, { redirectTo: "/" });
        }
    };

    useEffect(() => {
        logEvent('page_load', { pageName: 'Sign In', action: 'User opened Sign In Page.' });
    }, []);

    return (
        <div className="container mx-auto px-4 py-6 max-w-sm">
            <div className="flex flex-col gap-2 items-center border border-gray-300 rounded-md p-4 shadow-md">
                {providerMap.map((provider) => (
                    provider.id === 'nodemailer' ? (
                        <div key={provider.id} className="w-full">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 mb-2 border rounded"
                            />
                            <button
                                onClick={() => handleSignIn(provider.id)}
                                className="w-full p-2 bg-blue-500 text-white rounded"
                            >
                                Sign in with Email
                            </button>
                        </div>
                    ) : (
                        <button
                            key={provider.id}
                            onClick={() => handleSignIn(provider.id)}
                            className="gsi-material-button"
                        >
                            <div className="gsi-material-button-content-wrapper">
                                <div className="gsi-material-button-icon">
                                    <GoogleIcon />
                                </div>
                                <div className="gsi-material-button-contents">
                                    Sign in with {provider.name}
                                </div>
                            </div>
                        </button>
                    )
                ))}
            </div>
        </div>
    )
}