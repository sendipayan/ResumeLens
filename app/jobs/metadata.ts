import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Job Recommendations",
  description:
    "Browse role recommendations and curated job links based on your resume analysis.",
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    url: "/jobs",
    title: "Job Recommendations",
    description:
      "Browse role recommendations and curated job links based on your resume analysis.",
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
    title: "Job Recommendations",
    description:
      "Browse role recommendations and curated job links based on your resume analysis.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
