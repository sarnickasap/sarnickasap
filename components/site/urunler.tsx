import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { UrunListesi } from "./urun-listesi";
import type { UrunVerisi } from "./urun-karti";
import { FiyatlarGuncelleniyor } from "./fiyatlar-guncelleniyor";

/* ──────────────────────────────────────────────────────────────────────────
   Ürünler Bölümü — vault "Urunler Bolumu" notundan birebir.
     section  max-w 1280 · mx-auto · p 112px 24px · flex-col · gap36
     başlık   flex-col · gap12 · max-w 640
       eyebrow 12px/600 · ls .12em · uppercase · #e0464e
       h2      DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em · #f8efea
       p       16px · lh1.6 · #a3a3a3

   Stok programı kataloğu varken (K-37) açıklama birim/sipariş bilgisini
   anlatır ve altına "KDV dahil · Son güncelleme" satırı eklenir
   (12px · #8a8a8a — ürün kartı kategori etiketiyle aynı ton).
   Katalog yokken metin tasarımdaki gibi AYNEN kalır.

   Astryx: başlık bloğu VStack + Text (eyebrow, açıklama) + Heading (h2).
   <section> kimliğiyle (#urunler, nav çapası) yerel öğe olarak kalır.
   ────────────────────────────────────────────────────────────────────────── */

export type KatalogBilgisi = {
  /** Europe/Istanbul'da biçimlenmiş son güncelleme */
  guncelleme: string;
  kdvDahil: boolean;
  siparisAcik: boolean;
};

const KATALOG_ACIKLAMASI = {
  siparisli:
    "Fiyatlar kilogram ya da adet başınadır, stok programımızdan anlık gelir. Sepete ekleyip gel-al ya da eve teslim sipariş verebilir, dilerseniz WhatsApp’tan yazabilirsiniz.",
  siparissiz:
    "Fiyatlar kilogram ya da adet başınadır, stok programımızdan anlık gelir. İstediğiniz kesim ve gramajı WhatsApp’tan yazın.",
} as const;

export function Urunler({
  urunler,
  kategoriler,
  whatsapp,
  katalog,
  fiyatlarYok = false,
}: {
  urunler: UrunVerisi[];
  kategoriler: string[];
  whatsapp: string;
  /** null → veritabanı yedeği: tasarımdaki metin, sipariş kapalı */
  katalog: KatalogBilgisi | null;
  fiyatlarYok?: boolean;
}) {
  return (
    <section
      id="urunler"
      className="mx-auto flex max-w-[1280px] flex-col gap-36 px-24 py-112"
    >
      <VStack gap={3} maxWidth={640}>
        <Text weight="semibold" color="accent" className="text-12 tracking-eyebrow uppercase">
          Ürünler ve fiyatlar
        </Text>
        <Heading level={2} className="font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
          Güncel fiyatlar
        </Heading>
        {fiyatlarYok ? null : katalog ? (
          <>
            <Text as="p" color="secondary" className="text-16 leading-16">
              {katalog.siparisAcik
                ? KATALOG_ACIKLAMASI.siparisli
                : KATALOG_ACIKLAMASI.siparissiz}
            </Text>
            <Text as="p" className="text-12 text-muted-dark">
              {katalog.kdvDahil ? "Fiyatlar KDV dahildir · " : ""}Son
              güncelleme: {katalog.guncelleme}
            </Text>
          </>
        ) : (
          <Text as="p" color="secondary" className="text-16 leading-16">
            Fiyatlar kilogram başınadır ve günlük güncellenir. İstediğiniz kesim
            ve gramajı WhatsApp’tan yazın.
          </Text>
        )}
      </VStack>

      {fiyatlarYok ? (
        <FiyatlarGuncelleniyor whatsapp={whatsapp} />
      ) : (
        <UrunListesi
          urunler={urunler}
          kategoriler={kategoriler}
          whatsapp={whatsapp}
          siparisAcik={katalog?.siparisAcik ?? false}
        />
      )}
    </section>
  );
}
