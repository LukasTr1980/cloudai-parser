'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { AvatarIcon } from "@/app/components/Icons";
import Spinner from "./Spinner";
import Link from "next/link";
import { logEvent } from "../utils/logger";
import { usePathname } from "next/navigation";

export default function UserAvatar() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const toggleDropDown = () => setIsOpen((prev) => !prev);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSignOut = async () => {
        signOut({ callbackUrl: '/signout' });
    };

    if (pathname !== '/signin') {
        if (status === 'loading') {
            return (
                <div className="w-10 h-10 flex items-center justify-center">
                    <Spinner className="w-6 h-6" />
                </div>
            );
        }
    }

    if (!session?.user) {
        if (pathname !== '/signin') {
            return (
                <Link
                    href="/signin"
                    className="inline-block px-2 sm:px-4 md:px-5 lg:px-6 py-2 border border-transparent text-base font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                        logEvent('link_click', {
                            buttonName: 'Header Sign In',
                            action: 'User clicked the Header Sign In link',
                        })
                    }
                >
                    Sign In
                </Link>
            );
        }
        return null;
    }

    const user = session.user;

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="rounded-full border border-gray-300 overflow-hidden w-10 h-10 cursor-pointer"
                onClick={toggleDropDown}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                ) : (
                    <AvatarIcon className="w-10 h-10" />
                )}
            </div>

            <div className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg transition-all duration-200 transform ${isOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none'
                }`}
            >
                <div className="px-3 py-4">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <hr />
                <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}