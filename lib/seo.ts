import "server-only";
import { calismaSaatleriGetir, siteBilgisiGetir } from "@/lib/data";

/* ──────────────────────────────────────────────────────────────────────────
   SEO yardımcıları — TASARIMDA YOK (karar K-11).
   Tasarımda <title>, meta description, Open Graph, favicon, lang — hiçbiri
   yoktu. Başlık ve açıklama panelden yönetiliyor (SEO sekmesi).
   ────────────────────────────────────────────────────────────────────────── */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sarnickasap.com";

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
export async function yapilandirilmisVeri() {
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
  };
}
