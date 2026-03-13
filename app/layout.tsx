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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Resumelens",
    template: "%s | Resumelens",
  },
  description: "Analyze your resume, uncover skill gaps, and improve ATS fit.",
  applicationName: "Resumelens",
  keywords: [
    "resume analysis",
    "ATS check",
    "job description match",
    "resume scoring",
    "career tools",
  ],
  authors: [{ name: "Resumelens" }],
  creator: "Resumelens",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Resumelens",
    title: "Resumelens",
    description: "Analyze your resume, uncover skill gaps, and improve ATS fit.",
    images: [
      {
        url: "/landing_page.png",
        width: 1200,
        height: 630,
        alt: "Resumelens resume analysis preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumelens",
    description: "Analyze your resume, uncover skill gaps, and improve ATS fit.",
    images: ["/landing_page.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "career",
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
