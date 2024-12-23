import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";
import Header from "./components/Header";
import Script from "next/script";
import { Providers } from "./providers";

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
  description: `TLX Tech specializes in extracting text from PDFs and images using advanced 
  AI and OCR technologies. Our solutions help you convert visual documents into editable and 
  searchable text, simplifying data extraction and document management processes across various industries.`,
  openGraph: {
    title: "TLX Tech - AI & OCR Solutions",
    description: `TLX Tech specializes in extracting text from PDFs and images using advanced 
    AI and OCR technologies. Our solutions help you convert visual documents into editable and 
    searchable text, simplifying data extraction and document management processes across various industries.`,
    url: "https://tlx.page",
    siteName: "TLX Tech",
    images: [
      {
        url: "https://tlx.page/images/logo-800x400.png",
        width: 800,
        height: 400,
        alt: "TLX Tech Open Graph Image",
      },
    ],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const apiToken = cookieStore.get('api_token')?.value || '';

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Script id="set-api-token" strategy="beforeInteractive">
          {`window.API_TOKEN = "${apiToken}";`}
        </Script>

        <Providers>
          <Header />

          <hr className="border-t border-gray-300" />

          <main className="flex flex-grow justify-center">
            <div className="w-full max-w-5xl mx-2">
              {children}
            </div>
          </main>
          <footer className="text-center text-gray-500 text-sm py-4">
            {new Date().getFullYear()} Cloud AI Parser
          </footer>
        </Providers>
      </body>
    </html>
  );
}
