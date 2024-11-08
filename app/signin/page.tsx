"use client";

import { signIn } from "next-auth/react";
import { GoogleIcon } from "../components/Icons";
import { useEffect, useState } from "react";
import { logEvent } from "../utils/logger";
import Joi from "joi";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const emailSchema = Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .custom((value, helpers) => {
            if (value.includes(",") || value.includes(" ")) {
                return helpers.error("email.invalid");
            }
            return value;
        }, "Single EMail Validation");

    const handleSignIn = (providerId: string) => {
        logEvent('button_click', {
            provider: providerId,
            action: `User signed in with ${providerId}`,
        });

        if (providerId === 'nodemailer') {
            const { error } = emailSchema.validate(email);
            if (error) {
                setEmailError("Please enter a valid email address.");
                logEvent('Error', { errorMessage: 'User entered an invalid email addresse' });
                return;
            }

            setEmailError("");
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
            <div className="flex flex-col gap-4 items-center border border-gray-300 rounded-md p-4 shadow-md">
                <div className="w-full">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-2 mb-2 border rounded ${emailError ? "border-red-500" : ""
                            }`}
                    />
                    {emailError && (
                        <p className="text-red-500 text-sm mb-2">{emailError}</p>
                    )}
                    <button
                        onClick={() => handleSignIn('nodemailer')}
                        className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        Sign in with Email
                    </button>
                </div>

                <div className="flex items-center w-full">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-gray-500">or</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <button
                    onClick={() => handleSignIn('google')}
                    className="gsi-material-button w-full"
                >
                    <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                            <GoogleIcon />
                        </div>
                        <div className="gsi-material-button-contents">
                            Sign in with Google
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}