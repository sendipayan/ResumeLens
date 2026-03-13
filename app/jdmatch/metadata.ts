import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "JD Match",
  description:
    "Match your resume against a job description and see skill gaps and fit scores.",
  alternates: {
    canonical: "/jdmatch",
  },
  openGraph: {
    url: "/jdmatch",
    title: "JD Match",
    description:
      "Match your resume against a job description and see skill gaps and fit scores.",
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
    title: "JD Match",
    description:
      "Match your resume against a job description and see skill gaps and fit scores.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
