import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";
import Header from "./components/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TLX Tech",
  description: "Extract text from PDFs and images using the power of AI and OCR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const apiToken = cookieStore.get('api_token')?.value || '';

  return (
    <html lang="en">
      <head>
        <script
          src='https://charts.cx/cdn/setApiToken.js'
          data-api-token={apiToken}
          defer
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />

        <hr className="border-t border-gray-300" />

        <div className="flex flex-grow justify-center">
          <div className="w-full max-w-5xl mx-2">
            {children}
          </div>
        </div>
        <footer className="text-center text-gray-500 text-sm py-4">
          {new Date().getFullYear()} Cloud AI Parser
        </footer>
      </body>
    </html>
  );
}
