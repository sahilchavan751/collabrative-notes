import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CollabNotes — Real-time Collaborative Notes",
  description:
    "Create, edit, and collaborate on notes in real-time with voice chat. Built with Next.js, Firebase, and Yjs.",
  keywords: ["collaborative notes", "real-time editing", "voice chat", "note taking"],
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
