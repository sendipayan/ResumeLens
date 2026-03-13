import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "ATS Resume Check",
  description:
    "Get ATS compatibility scores, formatting checks, and issue insights for your resume.",
  alternates: {
    canonical: "/ats",
  },
  openGraph: {
    url: "/ats",
    title: "ATS Resume Check",
    description:
      "Get ATS compatibility scores, formatting checks, and issue insights for your resume.",
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
    title: "ATS Resume Check",
    description:
      "Get ATS compatibility scores, formatting checks, and issue insights for your resume.",
    images: ["/landing_page.png"],
  },
  metadataBase: new URL(siteUrl),
};
