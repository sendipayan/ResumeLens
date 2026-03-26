import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "ATS Checker & Resume Analyzer",
  description:
    "Run an ATS checker and resume analyzer to get compatibility scores, formatting checks, and issue insights.",
  keywords: [
    "ATS checker",
    "resume analyzer",
    "ATS resume checker",
    "resume analysis",
    "ATS score",
  ],
  alternates: {
    canonical: "/ats",
  },
  openGraph: {
    url: "/ats",
    title: "ATS Checker & Resume Analyzer",
    description:
      "Run an ATS checker and resume analyzer to get compatibility scores, formatting checks, and issue insights.",
    images: [
      {
        url: "/landing_page.png",
        width: 1200,
        height: 630,
        alt: "Resumelens ATS check preview",
      },
    ],
  },
  twitter: {
    title: "ATS Checker & Resume Analyzer",
    description:
      "Run an ATS checker and resume analyzer to get compatibility scores, formatting checks, and issue insights.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
