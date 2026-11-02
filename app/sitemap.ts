import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { siteBilgisiGetir } from "@/lib/data";
import { kategoriOzetleri } from "@/lib/urun-kaynagi";
import { urunKaynagiGetir } from "@/lib/urun-verisi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [info, kaynak] = await Promise.all([siteBilgisiGetir(), urunKaynagiGetir()]);
  /* Kategori sayfaları (aşama 4) — ana sayfayla aynı kaynaktan. Katalog
     varken son değişiklik zamanı katalogdan, yoksa site bilgisinden. */
  const urunDegisimi = kaynak.katalog ? new Date(kaynak.katalog.updatedAt) : info.updatedAt;
  const kategoriler: MetadataRoute.Sitemap = kategoriOzetleri(kaynak.kategoriler).map((k) => ({
    url: `${SITE_URL}/urunler/${k.slug}`,
    lastModified: urunDegisimi,
    changeFrequency: "daily",
    priority: 0.8,
  }));
  return [
    {
      url: SITE_URL,
      lastModified: info.updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...kategoriler,
    /* /sepet, /siparis ve /siparis/tamam BİLEREK yok — noindex (K-37). */
    {
      url: `${SITE_URL}/kvkk`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
