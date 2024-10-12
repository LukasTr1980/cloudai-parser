import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
  title: "Cloud AI Parser",
  description: "Convert Images or PDFs to text",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex flex-grow justify-center">
          <div className="w-full max-w-5xl mx-2 mt-6">
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
