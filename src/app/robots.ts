import type { MetadataRoute } from "next";
import { content } from "@/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${content.site.url}/sitemap.xml`,
  };
}
