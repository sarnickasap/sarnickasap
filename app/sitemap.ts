import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { siteBilgisiGetir } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const info = await siteBilgisiGetir();
  return [
    {
      url: SITE_URL,
      lastModified: info.updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    /* /sepet, /siparis ve /siparis/tamam BİLEREK yok — noindex (K-37). */
    {
      url: `${SITE_URL}/kvkk`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
