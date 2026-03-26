import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Resume Analyzer & ATS Checker",
  description:
    "Upload a resume to run our resume analyzer and ATS checker, then review skill coverage, role recommendations, and section-level scores.",
  keywords: [
    "resume analyzer",
    "ATS checker",
    "ATS resume checker",
    "resume analysis",
    "resume score",
  ],
  alternates: {
    canonical: "/analyze",
  },
  openGraph: {
    url: "/analyze",
    title: "Resume Analyzer & ATS Checker",
    description:
      "Upload a resume to run our resume analyzer and ATS checker, then review skill coverage, role recommendations, and section-level scores.",
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
    title: "Resume Analyzer & ATS Checker",
    description:
      "Upload a resume to run our resume analyzer and ATS checker, then review skill coverage, role recommendations, and section-level scores.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
