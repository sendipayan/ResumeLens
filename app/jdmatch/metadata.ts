import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "JD Match | Resume Analyzer & ATS Checker",
  description:
    "Match your resume against a job description with resume analyzer and ATS checker insights.",
  keywords: [
    "resume analyzer",
    "ATS checker",
    "job description match",
    "JD match",
    "resume analysis",
  ],
  alternates: {
    canonical: "/jdmatch",
  },
  openGraph: {
    url: "/jdmatch",
    title: "JD Match | Resume Analyzer & ATS Checker",
    description:
      "Match your resume against a job description with resume analyzer and ATS checker insights.",
    images: [
      {
        url: "/landing_page.png",
        width: 1200,
        height: 630,
        alt: "Resumelens JD match preview",
      },
    ],
  },
  twitter: {
    title: "JD Match | Resume Analyzer & ATS Checker",
    description:
      "Match your resume against a job description with resume analyzer and ATS checker insights.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
