import { Avatar } from "@astryxdesign/core/Avatar";
import { Blockquote } from "@astryxdesign/core/Blockquote";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { BolumBasligi } from "./bilgi-bolum-basligi";

/* ──────────────────────────────────────────────────────────────────────────
   Yorumlar — vault "Yorumlar Bolumu" + "Yorum Karti" notlarından birebir.

     section  1px #1f1f1f ÜST kenarlık · bg #0f0f0f
     iç       max-w 1280 · mx-auto · p 112px 24px · flex-col · gap32
     başlık   BolumBasligi → eyebrow #e0464e + h2 "Müşterilerimiz ne diyor"
     ızgara   Astryx Grid · min 320px sütun · en çok 3 · gap16
     kart     Astryx Card (1px #1f1f1f · r12 · bg #0a0a0a) · p24
              içinde <figure> · flex-col · gap18
       yıldız  flex · gap2 · 16px · letter-spacing 2px
               dolu #facc15 · sönük #333333   ← SVG değil, ★ (U+2605) metni
               (Astryx'te yıldız ikonu yok; ★ metni tasarımdan ve
               admin-yorumlar testi "★★★★" metnini arıyor)
       alıntı  Astryx Blockquote · flex-1 · 16px · lh1.6 · #e5e5e5 · pretty
       isim    figcaption → Astryx Avatar (baş harfler, dekoratif) +
               Text 14px/600 · #a3a3a3

   Yalnızca `visible: true` yorumlar listelenir.
   Gerçek yorum yoksa bölüm HİÇ render edilmez (K-15: uydurma yorum
   yayınlanmayacak; Google yorumlarından alınacak).
   ────────────────────────────────────────────────────────────────────────── */

export type YorumVerisi = {
  id: number;
  name: string;
  text: string;
  rating: number;
};

function Yildizlar({ puan }: { puan: number }) {
  const dolu = Math.max(0, Math.min(5, puan));
  return (
    <div
      className="flex gap-2 text-16 tracking-star"
      role="img"
      aria-label={`5 üzerinden ${dolu} yıldız`}
    >
      <span aria-hidden className="text-star">
        {"★".repeat(dolu)}
      </span>
      <span aria-hidden className="text-edge">
        {"★".repeat(5 - dolu)}
      </span>
    </div>
  );
}

export function Yorumlar({ yorumlar }: { yorumlar: YorumVerisi[] }) {
  if (yorumlar.length === 0) return null;

  return (
    <section id="yorumlar" className="border-t border-line bg-ink-2">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-32 px-24 py-112">
        <BolumBasligi ust="Müşteri yorumları" baslik="Müşterilerimiz ne diyor" />

        <Grid columns={{ minWidth: 320, max: 3 }} gap={4}>
          {yorumlar.map((y) => (
            <Card key={y.id} padding={6} className="flex">
              <figure className="m-0 flex flex-1 flex-col gap-18">
                <Yildizlar puan={y.rating} />
                <Blockquote className="m-0 flex-1 text-16 leading-16 text-pretty text-read">
                  {y.text}
                </Blockquote>
                <figcaption>
                  <HStack gap={3} vAlign="center">
                    {/* Ad yanında metin olarak yazılı → avatar dekoratif */}
                    <Avatar name={y.name} size="sm" tooltip={false} aria-hidden="true" />
                    <Text type="supporting" weight="semibold" className="text-14">
                      {y.name}
                    </Text>
                  </HStack>
                </figcaption>
              </figure>
            </Card>
          ))}
        </Grid>
      </div>
    </section>
  );
}
