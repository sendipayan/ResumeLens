import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/theme-provider";
import "./globals.css";
import Navbar from "@/components/navbar";
import Squares from "@/components/Squares";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumelens",
  description: "Analyze your skills. Discover your future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 -z-10 h-full w-full" aria-hidden>
              <Squares
                speed={0.5}
                squareSize={40}
                direction="diagonal"
                borderColor="#aea1a11d"
                hoverFillColor="#515151"
              />
            </div>
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
