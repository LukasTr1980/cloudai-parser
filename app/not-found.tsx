import Link from "next/link";

export default function NotFound() {
    return (
        <div className="text-center p-8 bg-white">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">404</h2>
            <p className="text-lg text-gray-600 mb-6">
                Oops! The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-300"
            >
                Return Home
            </Link>
        </div>
    );
}