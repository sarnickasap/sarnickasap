import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";

/* Tasarım şu Google Fonts isteğini yapıyor:
   family=DM+Sans:opsz,wght@9..40,500;9..40,600;9..40,700
   family=Inter:wght@400;500;600&display=swap

   Burada next/font ile SELF-HOST ediliyor (karar K-09): dosyalar build
   sırasında indirilip kendi alan adımızdan sunuluyor — CDN isteği yok.

   ⚠️  subsets'e "latin-ext" ZORUNLU: ğ ş ı İ karakterleri "latin" alt
   kümesinde YOK. Eksik bırakılırsa Türkçe harfler sistem fontuna düşer ve
   tasarımla piksel farkı oluşur. (ç ö ü "latin" içinde, ama diğerleri değil.) */

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

/* Geçici metadata — D1 aşamasında veritabanındaki SEO alanlarından
   generateMetadata ile üretilecek (karar K-11). */
export const metadata: Metadata = {
  title: "Sarnıç Kasap",
  description: "Gaziemir'de taze et, doğru kesim.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${inter.variable}`}>
      {/* Tasarım: body{font-family:Inter;-webkit-font-smoothing:antialiased}
          Zemin rengi bölüm bazında veriliyor — site koyu, admin açık. */}
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
