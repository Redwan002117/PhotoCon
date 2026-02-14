import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoCon - Professional In-Browser Image Tools",
  description: "Convert, Edit, and Optimize images locally in your browser. Secure, fast, and free tools for format conversion, compression, resizing, and more.",
  keywords: ["image convert", "image compressor", "photo editor", "heic to jpg", "client-side", "privacy", "photocon", "image tools"],
  authors: [{ name: "Redwan" }],
  openGraph: {
    title: "PhotoCon - Professional Image Tools",
    description: "Convert, Edit, and Optimize images locally in your browser. No uploads, secure and fast.",
    url: "https://photocon.vercel.app",
    siteName: "PhotoCon",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PhotoCon App Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoCon - Professional Image Tools",
    description: "Convert, Edit, and Optimize images locally in your browser.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    // Preload WASM file to start download early
    'link': 'rel="preload" href="/wasm/magick.wasm" as="fetch" crossorigin="anonymous"'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 pb-16 md:pb-0`}
      >
        {children}
      </body>
    </html>
  );
}
