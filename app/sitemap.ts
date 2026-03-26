import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/analyze", "/ats", "/jdmatch", "/jobs"];
  const lastModified = new Date();
  const routeConfig: Record<
    string,
    { changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }
  > = {
    "": { changeFrequency: "weekly", priority: 1 },
    "/analyze": { changeFrequency: "weekly", priority: 0.9 },
    "/ats": { changeFrequency: "weekly", priority: 0.9 },
    "/jdmatch": { changeFrequency: "monthly", priority: 0.8 },
    "/jobs": { changeFrequency: "weekly", priority: 0.8 },
  };

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: routeConfig[route]?.changeFrequency ?? "monthly",
    priority: routeConfig[route]?.priority ?? 0.7,
  }));
}
