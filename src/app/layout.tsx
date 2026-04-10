import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://realno.vercel.app"),
  title: {
    default: "REALNO — Real-time Collaborative Notes & Voice",
    template: "%s | REALNO"
  },
  description: "Experience the next level of teamwork with REALNO. A high-speed, real-time collaborative notes editor with integrated voice chat and professional dark aesthetics.",
  keywords: [
    "realtime notes", 
    "collaberative notes", 
    "notes", 
    "online notes", 
    "online notes editor", 
    "collaborative editing", 
    "real-time synchronization", 
    "team notes", 
    "voice chat"
  ],
  authors: [{ name: "REALNO Team" }],
  creator: "REALNO",
  publisher: "REALNO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "REALNO — Real-time Collaborative Notes & Voice",
    description: "Built for modern teams. Real-time note collaboration with zero latency and integrated voice communication.",
    url: "https://realno.vercel.app",
    siteName: "REALNO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "REALNO Workspace Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REALNO — Real-time Collaborative Notes",
    description: "The next generation of real-time collaborative notes with integrated voice chat.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://realno.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
