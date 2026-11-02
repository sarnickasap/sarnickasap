import type { UrunVerisi } from "@/components/site/urun-karti";
import type { Katalog } from "@/lib/stok-sema";
import { katalogUrunleri } from "@/lib/urun-kaynagi";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün yapılandırılmış verisi (schema.org) — ana sayfanın OfferCatalog'u
   (K-37) ve kategori sayfalarının ItemList + BreadcrumbList'i (aşama 4).

   Fiyat birim başına (kg ya da adet) — `UnitPriceSpecification` bunu açıkça
   söylüyor; düz `price` kilogram fiyatını paket fiyatı gibi gösterirdi.
   Girdi `UrunVerisi`: katalog da DB yedeği de aynı biçimde gelir; görsel
   ve kampanya alanları zaten doğrulanmış (lib/urun-kaynagi.ts).
   ────────────────────────────────────────────────────────────────────────── */

/** UN/CEFACT birim kodları: KGM = kilogram, H87 = adet */
const BIRIM_KODU = { kg: "KGM", adet: "H87" } as const;

/** Offer — kampanyalı üründe `priceValidUntil` kampanyanın son günü. */
function teklif(u: UrunVerisi, kdvDahil: boolean, url?: string) {
  return {
    "@type": "Offer",
    priceCurrency: "TRY",
    price: u.price,
    ...(u.listPrice !== null && u.campaignUntil ? { priceValidUntil: u.campaignUntil } : {}),
    availability: u.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    ...(url ? { url } : {}),
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: u.price,
      priceCurrency: "TRY",
      valueAddedTaxIncluded: kdvDahil,
      unitCode: BIRIM_KODU[u.unit],
    },
  };
}

function urunTemeli(u: UrunVerisi) {
  return {
    "@type": "Product",
    name: u.name,
    category: u.cat,
    ...(u.note ? { description: u.note } : {}),
    ...(u.imageUrl ? { image: u.imageUrl } : {}),
  };
}

/** Ana sayfa: stok programı kataloğundan OfferCatalog (K-37). */
export function teklifKatalogu(k: Katalog) {
  return {
    "@type": "OfferCatalog",
    name: "Ürünler ve fiyatlar",
    itemListElement: katalogUrunleri(k).map((u) => ({
      ...teklif(u, k.vatIncluded),
      itemOffered: urunTemeli(u),
    })),
  };
}

/** Kategori sayfası: BreadcrumbList + Product/Offer listesi. */
export function kategoriJsonLd(o: {
  ad: string;
  url: string;
  anaSayfa: string;
  urunler: UrunVerisi[];
  kdvDahil: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: o.anaSayfa },
          { "@type": "ListItem", position: 2, name: `${o.ad} fiyatları`, item: o.url },
        ],
      },
      {
        "@type": "ItemList",
        name: `${o.ad} fiyatları`,
        url: o.url,
        numberOfItems: o.urunler.length,
        itemListElement: o.urunler.map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: { ...urunTemeli(u), offers: teklif(u, o.kdvDahil, o.url) },
        })),
      },
    ],
  };
}
