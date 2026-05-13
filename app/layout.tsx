import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/lib/hooks/useProfile";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevOps Learn — Modern Engineering Learning Platform",
  description:
    "Master Git, GitHub Actions, Python, and Docker with hands-on lessons, labs, and real-world projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} data-scroll-behavior="smooth">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
