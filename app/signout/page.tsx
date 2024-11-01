"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
            <p className="text-xl font-semibold text-gray-800">Signed out successfully... Redirecting</p>
        </div>
        </div>
    );
}