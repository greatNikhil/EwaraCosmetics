import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.ewaraofficial.com";

const routes = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.95, changeFrequency: "daily" },
  { path: "/new-arrivals", priority: 0.8, changeFrequency: "daily" },
  { path: "/offers", priority: 0.75, changeFrequency: "weekly" },
  { path: "/category/skincare", priority: 0.75, changeFrequency: "weekly" },
  { path: "/category/hair", priority: 0.75, changeFrequency: "weekly" },
  { path: "/category/fragrance", priority: 0.75, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/services", priority: 0.55, changeFrequency: "monthly" },
  { path: "/policies/privacy", priority: 0.45, changeFrequency: "yearly" },
  { path: "/policies/terms", priority: 0.45, changeFrequency: "yearly" },
  { path: "/policies/refund", priority: 0.45, changeFrequency: "yearly" },
  { path: "/policies/shipping", priority: 0.45, changeFrequency: "yearly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
