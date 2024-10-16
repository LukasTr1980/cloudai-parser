import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex flex-grow justify-center">
          <div className="w-full max-w-5xl mx-2">
            {children}
            <script
            dangerouslySetInnerHTML={{
              __html: `window.API_TOKEN = '${apiToken}';`,
            }}
            />
          </div>
        </div>
        <footer className="text-center text-gray-500 text-sm py-4">
          {new Date().getFullYear()} Cloud AI Parser
        </footer>
      </body>
    </html>
  );
}
