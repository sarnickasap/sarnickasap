import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Logo } from "@/components/logo";
import { BOLUM_BASLIGI, UstBaslik } from "./bilgi-bolum-basligi";
import { SiteFooter } from "./footer";
import { SepetDugmesi } from "./sepet-dugmesi";

/* ──────────────────────────────────────────────────────────────────────────
   Alt sayfa kabuğu (/sepet, /siparis, /kvkk, /urunler/<kategori>) — TASARIMDA YOK (K-37).
   Ana sayfa başlığının yapısı korunur (sticky · rgba(10,10,10,.88) · blur ·
   1px #1f1f1f alt kenarlık · max-w 1280 · 10px 24px), ama bölüm çapaları
   yerine ana sayfaya dönüş bağlantısı (Astryx ghost Button) var — `#urunler` gibi çapalar bu
   sayfalarda boşa düşerdi.

   İçerik sütunu: max-w 880 · p 56px 24px 112px · başlık ana sayfadaki
   bölüm başlığıyla aynı (eyebrow + başlık), burada h1.

   Astryx: HStack (başlık satırı) · Link (logo → ana sayfa) · Button ·
   VStack · Text · Heading. <header>/<main> yerli öğe (landmark'lar,
   #ana-icerik atlama hedefi).
   ────────────────────────────────────────────────────────────────────────── */

export function AltSayfa({
  ust,
  baslik,
  aciklama,
  sepetVar = false,
  ustBilgi,
  children,
}: {
  ust: string;
  baslik: string;
  aciklama?: React.ReactNode;
  sepetVar?: boolean;
  /** Başlığın üstünde (ör. kategori sayfasında sayfa yolu) */
  ustBilgi?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-body">
      <header className="sticky top-0 z-20 border-b border-line bg-[rgba(10,10,10,0.88)] backdrop-blur-[10px]">
        <HStack vAlign="center" gap={4} className="mx-auto max-w-[1280px] px-24 py-10">
          <Link href="/" label="Ana sayfa" color="inherit" className="flex flex-none items-center">
            <Logo genislik={48} yukseklik={46} alt="Sarnıç Kasap" className="block h-46 w-48 object-contain" />
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="lg" label="Ürünlere dön" href="/#urunler" className="text-14 text-muted hover:text-body" />
          {sepetVar && <SepetDugmesi />}
        </HStack>
      </header>

      <main id="ana-icerik" className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-32 px-24 pt-56 pb-112">
        <VStack gap={3}>
          {ustBilgi}
          <UstBaslik>{ust}</UstBaslik>
          <Heading level={1} className={BOLUM_BASLIGI}>{baslik}</Heading>
          {aciklama && (
            <Text as="div" color="secondary" className="m-0 text-16 leading-16">
              {aciklama}
            </Text>
          )}
        </VStack>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
