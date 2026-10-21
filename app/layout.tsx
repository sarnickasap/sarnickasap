import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { siteBilgisiGetir } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

/* Tasarım şu Google Fonts isteğini yapıyor:
   family=DM+Sans:opsz,wght@9..40,500;9..40,600;9..40,700
   family=Inter:wght@400;500;600&display=swap

   Burada next/font ile SELF-HOST ediliyor (karar K-09): dosyalar build
   sırasında indirilip kendi alan adımızdan sunuluyor — CDN isteği yok.

   ⚠️  subsets'e "latin-ext" ZORUNLU: ğ ş ı İ karakterleri "latin" alt
   kümesinde YOK. Eksik bırakılırsa Türkçe harfler sistem fontuna düşer ve
   tasarımla piksel farkı oluşur. (ç ö ü "latin" içinde, ama diğerleri değil.) */

/* ⚠️ `axes: ["opsz"]` ZORUNLU.
   Tasarım fontu `opsz,wght@9..40,...` diye istiyor — yani OPTİK BOYUT ekseni
   dahil. Tarayıcı `font-optical-sizing: auto` ile ekseni font boyutuna göre
   ayarlar: 84px'lik başlıkta opsz 40'a tırmanır ve harfler daralır.
   Eksen dahil edilmezse font varsayılan opsz ile gelir, harfler GENİŞ kalır.
   Ölçüldü: H1'de gözle görülür genişlik farkı; paragraf (18px) etkilenmiyor
   çünkü orada opsz zaten varsayılana yakın. */
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: false,
});

/* ⚠️ `adjustFontFallback: false` — next/font varsayılan olarak ölçüleri
   ayarlanmış bir yedek font ("Inter Fallback") üretip font yığınına ekliyor.
   Fontta OLMAYAN bir glif (ör. "→" U+2192) o yedekten çiziliyor ve
   tasarımdan farklı genişlikte oluyor:
     tasarım  (Inter, system-ui, sans-serif)        → ok 12,53 px
     ayarlı yedekle                                 → ok 14,99 px
   Bu 2,5 px fark, admin "Toplu fiyat" önizlemesinde tüm fiyat sütununu
   kaydırıp 35.622 piksel farka yol açıyordu.
   Kapatınca yığın tasarımdakiyle birebir aynı oluyor.

   Bedeli: font yüklenirken oluşan düzen kaymasını azaltan ayar devre dışı.
   Fontlar self-host ve preload edildiği için pencere çok kısa. */

/* Metadata veritabanındaki SEO alanlarından üretiliyor (K-11) — başlık ve
   açıklama panelin SEO sekmesinden yönetiliyor. */
export async function generateMetadata(): Promise<Metadata> {
  const info = await siteBilgisiGetir();
  const baslik = info.seoTitle || "Sarnıç Kasap";
  const aciklama = info.seoDescription || info.heroSub;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: baslik, template: "%s — Sarnıç Kasap" },
    description: aciklama,
    applicationName: "Sarnıç Kasap",
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "Sarnıç Kasap",
      title: baslik,
      description: aciklama,
      url: SITE_URL,
      images: [{ url: "/logo.png", width: 1420, height: 1350, alt: "Sarnıç Kasap" }],
    },
    twitter: { card: "summary", title: baslik, description: aciklama },
    alternates: { canonical: SITE_URL },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${inter.variable}`}>
      {/* Tasarım: body{font-family:Inter;-webkit-font-smoothing:antialiased}
          Zemin rengi bölüm bazında veriliyor — site koyu, admin açık. */}
      <body className="font-sans antialiased">
        {children}
        {/* Vercel Analytics (K-24) — çerezsiz, kişisel veri toplamıyor.
            Vercel panelinde Web Analytics'in AÇIK olması gerekir. */}
        <Analytics />
      </body>
    </html>
  );
}
