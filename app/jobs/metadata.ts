import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "ATS Checker Job Matches",
  description:
    "Browse ATS checker job matches and curated links based on your resume analyzer results.",
  keywords: [
    "resume analyzer",
    "ATS checker",
    "job recommendations",
    "resume analysis",
    "role matching",
  ],
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    url: "/jobs",
    title: "ATS Checker Job Matches",
    description:
      "Browse ATS checker job matches and curated links based on your resume analyzer results.",
    images: [
      {
        url: "/landing_page.png",
        width: 1200,
        height: 630,
        alt: "Resumelens job recommendations preview",
      },
    ],
  },
  twitter: {
    title: "ATS Checker Job Matches",
    description:
      "Browse ATS checker job matches and curated links based on your resume analyzer results.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
