import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Text } from "@astryxdesign/core/Text";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { VStack } from "@astryxdesign/core/VStack";
import { SagOkIkonu } from "@/components/icons";
import { fiyat, waLink, WA_MESAJ } from "@/lib/format";
import { birimSoneki } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";
import { yerelNitelikler } from "./astryx-yardimci";
import { SepeteEkle } from "./sepete-ekle";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün Kartı (ızgara hücresi) — vault "Urun Karti" notundan birebir.

     hücre  bg #0a0a0a · p22 · flex-col · gap14 · min-h 190
            KENDİ KENARLIĞI/YARIÇAPI YOK — ayrım ızgara gap:1px ile
     üst    justify-between · items-center · gap8
       kategori 12px/500 · #737373 (K-21 → #8a8a8a)
       rozet    Astryx Badge · 11px/600 · px8 · bg #262626 · #d4d4d4 · "Tükendi"
     metin  flex-col · gap4 · flex-1
       h3   DM Sans 20px/600 · ls -.01em · #f8efea
       p    13px · lh 1.45 · #a3a3a3   (not boşsa boş <p> yine render edilir)
     alt    items-center · justify-between · gap12
       fiyat items-baseline · gap4 → DM Sans 24px/700 beyaz + "/ kg" 13px
       ok    YALNIZCA stoktaysa · Astryx IconButton (bağlantı) · 36×36 ·
             1px #333333 · hover → bg+border #b8222a, beyaz

   Stok dışı davranış: kart soluklaşmaz, fiyat gizlenmez.
   Yalnızca rozet görünür ve ok butonu kaybolur.

   Stok programı kataloğu (K-37) — tasarımda YOK, kartın kendi diliyle:
     · birim soneki "/ kg" ya da "/ adet"
     · görsel YALNIZCA izinli Blob adresinden (lib/stok-sema.ts) —
       galerideki görselle aynı biçim (4/3 · r8 · #171717 zemin)
     · sipariş açıksa ve ürün stoktaysa miktar seçici + "Sepete ekle"
     · kampanyalı üründe (aşama 4) "Fırsat" rozeti — "Tükendi" rozetinin
       ölçüsünde, zemin #b8222a (fırsat bölümünün rengi) — ve fiyatın
       yanında üstü çizili eski fiyat (fırsat kartındaki gibi #8a8a8a)
   ────────────────────────────────────────────────────────────────────────── */

const ROZET = "rounded-pill px-8 text-11 font-semibold";

export type UrunVerisi = {
  /** React anahtarı: stok kodu ya da DB kimliği */
  anahtar: string;
  /** Stok programı ürün kodu; DB yedeğinde null (sipariş yok) */
  code: string | null;
  name: string;
  cat: string;
  price: number;
  note: string;
  stock: boolean;
  unit: Birim;
  imageUrl: string | null;
  /** Kampanya öncesi fiyat — yalnızca geçerli kampanyada (> price) dolu */
  listPrice: number | null;
  /** Kampanya son günü YYYY-MM-DD (dahil, Europe/Istanbul) */
  campaignUntil: string | null;
};

export function UrunKarti({
  urun,
  whatsapp,
  siparisAcik,
}: {
  urun: UrunVerisi;
  whatsapp: string;
  siparisAcik: boolean;
}) {
  return (
    <Card variant="transparent" padding={0} className="flex min-h-190 flex-col gap-14 rounded-none bg-ink p-22">
      {urun.imageUrl && (
        <AspectRatio ratio={4 / 3} fit="cover" className="overflow-hidden rounded-8 bg-hover">
          {/* Blob görseli — galeriyle aynı gerekçe: next/image uzak alan adı ister. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urun.imageUrl} alt={urun.name} loading="lazy" decoding="async" width={400} height={300} />
        </AspectRatio>
      )}
      <HStack align="center" justify="between" gap={2}>
        <Text weight="medium" className="text-12 text-muted-dark">{urun.cat}</Text>
        <HStack align="center" gap={1.5}>
          {urun.listPrice !== null && (
            <Badge label="Fırsat" className={`${ROZET} bg-brand text-white`} />
          )}
          {!urun.stock && (
            <Badge label="Tükendi" className={`${ROZET} bg-badge text-soft`} />
          )}
        </HStack>
      </HStack>

      <VStack gap={1} className="flex-1">
        <Heading level={3} className="font-display text-20 font-semibold tracking-product text-cream break-words">
          {urun.name}
        </Heading>
        <Text as="p" color="secondary" className="text-13 leading-145">{urun.note}</Text>
      </VStack>

      <HStack align="center" justify="between" gap={3}>
        <HStack wrap="wrap" gap={1} className="items-baseline">
          <Text weight="bold" className="font-display text-24 text-white">
            {fiyat(urun.price)}
          </Text>
          <Text className="text-13 text-muted-dark">{birimSoneki(urun.unit)}</Text>
          {urun.listPrice !== null && (
            <Text hasStrikethrough className="ml-4 text-13 text-muted-dark">
              <VisuallyHidden>Önceki fiyat: </VisuallyHidden>
              {fiyat(urun.listPrice)}
            </Text>
          )}
        </HStack>

        {urun.stock && (
          <IconButton
            href={waLink(whatsapp, WA_MESAJ.urun(urun.name))}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            label={`${urun.name} için WhatsApp’tan sor`}
            {...yerelNitelikler({ title: "WhatsApp’tan sor" })}
            icon={<SagOkIkonu size={16} />}
            className="h-36 w-36 border border-edge bg-transparent text-body hover:border-brand hover:bg-brand hover:text-white"
          />
        )}
      </HStack>

      {siparisAcik && urun.stock && urun.code && (
        <SepeteEkle code={urun.code} unit={urun.unit} name={urun.name} />
      )}
    </Card>
  );
}
