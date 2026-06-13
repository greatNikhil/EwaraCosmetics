import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.ewaraofficial.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/cart",
        "/checkout",
        "/orders",
        "/profile",
        "/wishlist",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
