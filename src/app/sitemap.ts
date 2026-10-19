import type { MetadataRoute } from "next";
import { content } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = content.site.url;
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
