import "server-only";
import type { Metadata } from "next";
import { calismaSaatleriGetir, siteBilgisiGetir } from "@/lib/data";
import type { Katalog } from "@/lib/stok-sema";
import { teklifKatalogu } from "@/lib/seo-urun";

/* ──────────────────────────────────────────────────────────────────────────
   SEO yardımcıları — TASARIMDA YOK (karar K-11).
   Tasarımda <title>, meta description, Open Graph, favicon, lang — hiçbiri
   yoktu. Başlık ve açıklama panelden yönetiliyor (SEO sekmesi).
   ────────────────────────────────────────────────────────────────────────── */

/**
 * JSON-LD'yi `<script>` içine gömmek için GÜVENLİ biçimde serileştirir.
 *
 * ⚠️ Düz `JSON.stringify` YETMEZ. HTML ayrıştırıcısı `<script>` bloğunu
 * gördüğü ilk `</script>` dizgisinde kapatır — JavaScript dizgisinin
 * içinde olması fark etmez. Panelden girilen bir metin (adres, SEO
 * açıklaması, hakkımızda) `</script><img onerror=…>` içerirse sayfaya
 * rastgele HTML enjekte edilebilirdi. Doğrulandı: `JSON.stringify`
 * `</script>` dizgisini olduğu gibi geçiriyor.
 *
 * `<`, `>` ve `&` karakterleri Unicode kaçışına çevriliyor — JSON olarak
 * hâlâ geçerli ve aynı değeri taşıyor, ama HTML ayrıştırıcısı için zararsız.
 * U+2028/U+2029 de kaçırılıyor (JS'te satır sonu sayılırlar).
 */
export function guvenliJsonLd(veri: unknown): string {
  return JSON.stringify(veri)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/* Birincil ana makine **www** (kullanıcı kararı: "www kalsın").
   Apex `sarnickasap.com` → `www.sarnickasap.com` 308 ile yönleniyor.

   HATA: varsayılan apex'te kalmıştı ve `NEXT_PUBLIC_SITE_URL` hiçbir yerde
   tanımlı olmadığı için canonical, og:url, JSON-LD `url`, `metadataBase`,
   `sitemap.xml` ve `robots.txt` hep **yönlenen** adresi gösteriyordu.
   Canonical'ın 308 dönen bir adresi işaret etmesi çelişkili bir sinyal.
   Tek kaynak burası; başka yerde elle yazılmıyor. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sarnickasap.com";

/* ── Paylaşım görseli (og:image) ──
   `site_info.og_image_url` doluysa o, değilse logo. Yalnızca mutlak
   https adresi kabul edilir; bozuk değer sessizce logoya düşer (sayfa
   metadata yüzünden asla hata vermesin). Panelde bu alan için ayrı bir
   giriş yok — değer doğrudan veritabanında. */
export type OgGorseli = { url: string; width?: number; height?: number; alt: string };

const LOGO_OG: OgGorseli = { url: "/logo.png", width: 1420, height: 1350, alt: "Sarnıç Kasap" };

export function ogGorselleri(ogImageUrl: string | null | undefined): OgGorseli[] {
  if (!ogImageUrl?.trim()) return [LOGO_OG];
  try {
    const u = new URL(ogImageUrl.trim());
    return u.protocol === "https:" ? [{ url: u.toString(), alt: "Sarnıç Kasap" }] : [LOGO_OG];
  } catch {
    return [LOGO_OG];
  }
}

/** Sayfanın kanonik adresi — her zaman SITE_URL (www) üzerinden. */
export function kanonikAdres(yol = "/"): string {
  return yol === "/" ? SITE_URL : `${SITE_URL}${yol.startsWith("/") ? yol : `/${yol}`}`;
}

/**
 * Alt sayfa metadata'sı: başlık, açıklama, kanonik adres ve Open Graph.
 * Next'te alt sayfa `openGraph` vermezse kök layout'unkini (og:url = ana
 * sayfa) AYNEN devralır; verirse nesne tümüyle değişir — bu yüzden
 * görseller de burada yeniden veriliyor.
 */
export function altSayfaMetadata(o: {
  baslik: string;
  aciklama: string;
  yol: string;
  ogImageUrl: string | null | undefined;
  /** true → kök şablon ("%s — Sarnıç Kasap") uygulanmaz */
  mutlakBaslik?: boolean;
}): Metadata {
  const url = kanonikAdres(o.yol);
  const gorseller = ogGorselleri(o.ogImageUrl);
  return {
    title: o.mutlakBaslik ? { absolute: o.baslik } : o.baslik,
    description: o.aciklama,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "Sarnıç Kasap",
      title: o.baslik,
      description: o.aciklama,
      url,
      images: gorseller,
    },
    twitter: { card: "summary", title: o.baslik, description: o.aciklama, images: gorseller },
  };
}

/** schema.org gün adları — hours tablosundaki sıra Pazartesi=0 */
const SCHEMA_GUN = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * LocalBusiness yapılandırılmış verisi. Google'ın yerel işletme kartında
 * adres, telefon ve çalışma saatlerini göstermesini sağlar.
 * Tüm değerler panelden geliyor — elle güncellenecek ikinci bir yer yok.
 */
export async function yapilandirilmisVeri(katalog: Katalog | null = null) {
  const [info, saatler] = await Promise.all([
    siteBilgisiGetir(),
    calismaSaatleriGetir(),
  ]);

  return {
    "@context": "https://schema.org",
    "@type": "Butcher",
    name: "Sarnıç Kasap",
    description: info.seoDescription || info.heroSub,
    url: SITE_URL,
    telephone: `+${info.whatsapp}`,
    image: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: info.address,
      addressLocality: "Gaziemir",
      addressRegion: "İzmir",
      addressCountry: "TR",
    },
    openingHoursSpecification: saatler
      .filter((s) => !s.closed)
      .map((s) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${SCHEMA_GUN[s.dayIndex]}`,
        opens: s.open,
        closes: s.close,
      })),
    ...(katalog && katalog.products.length > 0
      ? { hasOfferCatalog: teklifKatalogu(katalog) }
      : {}),
  };
}
