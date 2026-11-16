import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Suspense } from "react";
import { KonumIkonu, MesajIkonu, TelefonIkonu } from "@/components/icons";
import type { Saat } from "@/lib/saatler";
import { BolumBasligi } from "./bilgi-bolum-basligi";
import {
  CalismaSaatleri,
  CalismaSaatleriIskelet,
} from "./calisma-saatleri";
import { Harita } from "./harita";
import { haritaSorgusu, yolTarifiLinki } from "@/lib/format";

/* ──────────────────────────────────────────────────────────────────────────
   İletişim — vault "Iletisim Bolumu" notundan birebir.

     section  1px #1f1f1f ÜST kenarlık (zemin #0a0a0a devralınır)
     iç       max-w 1280 · mx-auto · p 112px 24px
              grid auto-fit minmax(min(100%,400px),1fr) · gap48
              ⚠️ align-items YOK → kolonlar stretch (harita sol kolon boyunca uzar)
     sol      VStack · gap32
       başlık gap12 → eyebrow #e0464e + h2 "Bize ulaşın"
       liste  flex-col · gap16 · satırlar gap14 · ikon #e0464e flex-none
         adres    items-start + ikon mt-2 · 16px lh1.5 #e5e5e5
         telefon  items-center · 16px #e5e5e5 → hover beyaz
         whatsapp items-center · "WhatsApp: {telefon}"
     sağ      min-h 420 · r12 · overflow-hidden · 1px #1f1f1f · bg #171717

   Harita (K-16): tasarımda sorgu SABİTTİ, admin'den adres değişse bile
   harita değişmiyordu. Artık adresten türetiliyor — İŞLETME ADI ÖNE
   EKLENEREK (bkz. lib/format.ts → haritaSorgusu). Yalnız adresle
   sorgulanınca Google dükkânı bulamıyor ve yanlış bölge gösteriyordu.

   Aşama 4: adresin altında "Yol tarifi al" (yeni sekmede Google
   Haritalar) ve harita tıklayınca yüklenir (harita.tsx, K-26 devamı).
   Bağlantı adres metniyle aynı sütunda: 14px/500 · #f8efea · alt çizgi.

   Astryx: VStack/HStack (düzen) · Text (adres) · Link (telefon, WhatsApp,
   yol tarifi — `isExternalLink` yeni sekme + dış bağlantı ikonu + ekran
   okuyucu notu + rel=noopener'ı kendisi ekler) · BolumBasligi.
   Kolon ızgarası Tailwind'de: Astryx Grid'in ölçeğinde 48px boşluk yok ve
   harita testi `#iletisim > div > div` yapısını ölçüyor.
   ────────────────────────────────────────────────────────────────────────── */

/** İletişim satırı bağlantısı — 16px · #e5e5e5 → hover beyaz */
const SATIR_BAGLANTISI =
  "text-16 text-read no-underline transition-colors duration-150 ease-out-soft hover:text-white";

export function Iletisim({
  address,
  phone,
  telLink,
  waLink,
  saatler,
}: {
  address: string;
  phone: string;
  telLink: string;
  waLink: string;
  saatler: Saat[];
}) {
  const haritaSrc = haritaSorgusu(address);

  return (
    <section id="iletisim" className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-48 px-24 py-112">
        <VStack gap={8}>
          <BolumBasligi ust="İletişim" baslik="Bize ulaşın" />

          <VStack gap={4}>
            <HStack vAlign="start" className="gap-14">
              <KonumIkonu size={20} className="mt-2 flex-none text-brand-accent" />
              <VStack className="gap-6">
                <Text className="text-16 leading-15 text-read">{address}</Text>
                <Link
                  href={yolTarifiLinki(address)}
                  isExternalLink
                  newTabLabel="(Google Haritalar, yeni sekmede açılır)"
                  color="inherit"
                  type="inherit"
                  hasUnderline
                  className="flex w-fit items-center gap-6 text-14 font-medium text-cream underline-offset-2 transition-colors duration-150 ease-out-soft hover:text-white"
                >
                  Yol tarifi al
                </Link>
              </VStack>
            </HStack>

            <HStack vAlign="center" className="gap-14">
              <TelefonIkonu size={20} className="flex-none text-brand-accent" />
              <Link href={telLink} color="inherit" type="inherit" className={SATIR_BAGLANTISI}>
                {phone}
              </Link>
            </HStack>

            <HStack vAlign="center" className="gap-14">
              <MesajIkonu size={20} className="flex-none text-brand-accent" />
              <Link
                href={waLink}
                target="_blank"
                color="inherit"
                type="inherit"
                className={SATIR_BAGLANTISI}
              >
                WhatsApp: {phone}
              </Link>
            </HStack>
          </VStack>

          <Suspense fallback={<CalismaSaatleriIskelet saatler={saatler} />}>
            <CalismaSaatleri saatler={saatler} />
          </Suspense>
        </VStack>

        <Harita src={haritaSrc} />
      </div>
    </section>
  );
}
