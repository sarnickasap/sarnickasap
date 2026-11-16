import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { VStack } from "@astryxdesign/core/VStack";
import { fiyat, indirimOrani, waLink, WA_MESAJ } from "@/lib/format";
import { CERCEVELI } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Fırsat Kartı — vault "Firsat Karti" notundan birebir.

     kart   Astryx Card (transparent → KENARLIK YOK) · bg #0a0a0a · r12 ·
            p24 · flex-col · gap18
     üst    justify-between · items-center · gap12
       pil    Astryx Badge · 12px/600 · px10 · r999 · bg #2a1012 · #f8efea
       oran   13px/600 · #f87171
     metin  flex-col · gap6 · flex-1
       h3     DM Sans 24px/600 · ls -.015em · #f8efea
       p      14px · lh 1.5 · #a3a3a3
     fiyat  items-baseline · gap10
       yeni   DM Sans 30px/700 · beyaz
       eski   15px · #737373 · line-through
     buton  Astryx Button (bağlantı) · tam genişlik · h40 · 1px #333333 ·
            14px/500 · #fafafa

   Aşama 4: çerçeve (`FirsatCercevesi`) iki kaynakça paylaşılıyor —
   panelin "Kampanyalar"ı (bu dosyadaki `FirsatKarti`) ve stok programı
   kampanyaları (`katalog-firsat-karti.tsx`). Görünüm birebir aynı;
   katalog kartı yeni fiyatın yanına birim soneki ekler.

   Astryx: Card, Badge (pil — e2e `#firsatlar .grid span` ilk span olarak
   bunu okur, sırası korunmalı), Heading (h3), Text, HStack/VStack, Button.
   ────────────────────────────────────────────────────────────────────────── */

export type FirsatVerisi = {
  id: number;
  title: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  until: string;
};

export type FirsatCercevesiProps = {
  /** Pil metni ("Bu hafta", "Son gün: 9 Kasım") */
  etiket: string;
  baslik: string;
  aciklama: string;
  yeniFiyat: number;
  /** 0 → boş span (tasarım: oldPrice yoksa boş string) */
  eskiFiyat: number;
  /** Yeni fiyatın yanındaki "/ kg" gibi sonek; yoksa render edilmez */
  sonek?: string;
  children: React.ReactNode;
};

export function FirsatCercevesi({
  etiket,
  baslik,
  aciklama,
  yeniFiyat,
  eskiFiyat,
  sonek,
  children,
}: FirsatCercevesiProps) {
  const oran = indirimOrani(eskiFiyat, yeniFiyat);

  return (
    <Card variant="transparent" padding={6} className="flex flex-col gap-18 bg-ink">
      <HStack align="center" justify="between" gap={3}>
        <Badge label={etiket} className="h-auto rounded-pill bg-pill px-10 py-4 text-12 font-semibold text-cream" />
        {/* Tasarımda indirim yoksa boş span yine render ediliyor — birebir */}
        <Text weight="semibold" className="text-13 text-discount">{oran}</Text>
      </HStack>

      <VStack className="flex-1 gap-6">
        <Heading level={3} className="font-display text-24 font-semibold tracking-deal text-cream break-words">
          {baslik}
        </Heading>
        <Text as="p" color="secondary" className="text-14 leading-15">{aciklama}</Text>
      </VStack>

      <HStack wrap="wrap" className="items-baseline gap-10">
        <Text weight="bold" className="font-display text-30 text-white">
          {fiyat(yeniFiyat)}
          {sonek && <Text color="secondary" weight="normal" className="ml-4 font-sans text-15">{sonek}</Text>}
        </Text>
        {/* Tasarım: oldPrice yoksa boş string — span yine var */}
        <Text hasStrikethrough className="text-15 text-muted-dark">
          {eskiFiyat ? (
            <>
              <VisuallyHidden>Önceki fiyat: </VisuallyHidden>
              {fiyat(eskiFiyat)}
            </>
          ) : (
            ""
          )}
        </Text>
      </HStack>

      {children}
    </Card>
  );
}

/** "Ayırt" — WhatsApp'a hazır mesajla gider. */
export function AyirtBaglantisi({ whatsapp, baslik }: { whatsapp: string; baslik: string }) {
  return (
    <Button
      href={waLink(whatsapp, WA_MESAJ.firsat(baslik))}
      target="_blank"
      rel="noopener noreferrer"
      size="lg"
      width="100%"
      label={`Ayırt — ${baslik}`}
      className={`h-40 text-14 ${CERCEVELI}`}
    >
      Ayırt
    </Button>
  );
}

/** Panelin "Kampanyalar" sekmesinden gelen fırsat. */
export function FirsatKarti({
  firsat,
  whatsapp,
}: {
  firsat: FirsatVerisi;
  whatsapp: string;
}) {
  return (
    <FirsatCercevesi
      etiket={firsat.until}
      baslik={firsat.title}
      aciklama={firsat.description}
      yeniFiyat={firsat.newPrice}
      eskiFiyat={firsat.oldPrice}
    >
      <AyirtBaglantisi whatsapp={whatsapp} baslik={firsat.title} />
    </FirsatCercevesi>
  );
}
