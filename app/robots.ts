import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Yönetim paneli arama sonuçlarında çıkmamalı
      disallow: ["/yonetim", "/yonetim/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
