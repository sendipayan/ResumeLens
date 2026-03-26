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
    default: "ResumeLens | Resume Analyzer & ATS Checker",
    template: "%s | ResumeLens",
  },
  description: "Use ResumeLens as a resume analyzer and ATS checker to score your resume, uncover skill gaps, and align your profile with job descriptions.",
  applicationName: "ResumeLens",
  keywords: [
    "resume analyzer",
    "ATS checker",
    "ATS resume checker",
    "resume analysis",
    "ATS check",
    "job description match",
    "resume scoring",
    "resume checker",
    "career tools",
  ],
  authors: [{ name: "ResumeLens" }],
  creator: "ResumeLens",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ResumeLens",
    title: "ResumeLens | Resume Analyzer & ATS Checker",
    description: "Use ResumeLens as a resume analyzer and ATS checker to score your resume, uncover skill gaps, and align your profile with job descriptions.",
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
    title: "ResumeLens | Resume Analyzer & ATS Checker",
    description: "Use ResumeLens as a resume analyzer and ATS checker to score your resume, uncover skill gaps, and align your profile with job descriptions.",
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
  verification: {
    google: "kSC2HRfSq6iCxeGolMsN4WR4_mqRLFoQ6u6298ceaz0",
  },
  category: "career",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeLens",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "featureList": [
      "Resume analyzer scoring",
      "ATS checker compatibility insights",
      "Job description match feedback",
      "Role recommendations"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "ResumeLens is a resume analyzer and ATS checker that scores your resume, uncovers skill gaps, and aligns your profile with job descriptions."
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
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
