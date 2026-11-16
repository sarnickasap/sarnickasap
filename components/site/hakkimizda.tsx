import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { BOLUM_BASLIGI, UstBaslik } from "./bilgi-bolum-basligi";

/* ──────────────────────────────────────────────────────────────────────────
   Hakkımızda — vault "Hakkimizda Bolumu" notundan birebir.

     section  1px #1f1f1f üst VE alt kenarlık · bg #0f0f0f
     iç       max-w 1280 · mx-auto · p 112px 24px
              grid auto-fit minmax(min(100%,420px),1fr) · gap56 · items-center
     (fotoğraf yer tutucusu kaldırıldı — müşteriye boş kutu görünüyordu)
     sağ      flex-col · gap20
       eyebrow 12px/600 · ls .12em · uppercase · #e0464e
       h2      DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em
               · #f8efea · text-wrap balance   ← balance YALNIZCA burada
       p       17px · lh1.7 · #a3a3a3 · text-wrap pretty

   Astryx: VStack (dikey düzen) · Text (eyebrow, paragraf) · Heading (h2).
   <section> yerli öğe olarak kalıyor: Astryx Section bir <div> basar ve
   sayfa bölgesi/çapa (#hakkimizda) anlamını kaybettirirdi.
   ────────────────────────────────────────────────────────────────────────── */

export function Hakkimizda({ about }: { about: string }) {
  return (
    <section
      id="hakkimizda"
      className="border-t border-b border-line bg-ink-2"
    >
      {/* Fotoğraf yer tutucusu kaldırıldı: gerçek fotoğraf gelene dek yalnızca metin. */}
      <div className="mx-auto max-w-[1280px] px-24 py-112">
        <VStack gap={5} maxWidth={720}>
          <UstBaslik>Hakkımızda</UstBaslik>
          <Heading level={2} textWrap="balance" className={BOLUM_BASLIGI}>
            Mahallenin kasabı
          </Heading>
          <Text
            as="p"
            color="secondary"
            textWrap="pretty"
            className="m-0 text-17 leading-17"
          >
            {about}
          </Text>
        </VStack>
      </div>
    </section>
  );
}
