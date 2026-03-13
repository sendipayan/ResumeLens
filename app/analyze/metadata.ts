import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Analyze Resume",
  description:
    "Upload a resume to get role recommendations, skill coverage, and section-level scores.",
  alternates: {
    canonical: "/analyze",
  },
  openGraph: {
    url: "/analyze",
    title: "Analyze Resume",
    description:
      "Upload a resume to get role recommendations, skill coverage, and section-level scores.",
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
    title: "Analyze Resume",
    description:
      "Upload a resume to get role recommendations, skill coverage, and section-level scores.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
