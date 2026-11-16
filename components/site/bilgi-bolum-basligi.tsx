import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

/* ──────────────────────────────────────────────────────────────────────────
   Bilgi bölümlerinin (Hakkımızda, Galeri, Yorumlar, İletişim, alt sayfalar)
   ortak başlığı — Astryx Text + Heading.

     eyebrow  Text type=label · color=accent (--color-text-accent = #e0464e)
              12px/600 · ls .12em · uppercase
     başlık   Heading · DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em
              · #f8efea (marka kremi; Astryx renk ölçeğinde yok → token sınıfı)

   Ölçü sınıfları Tailwind'de kalıyor: Astryx tip ölçeği (14px taban, 1.2
   oran) sitenin clamp() başlık ölçüsünü karşılamıyor. Tailwind `utilities`
   katmanı Astryx katmanlarından sonra geldiği için bu sınıflar kazanır.
   ────────────────────────────────────────────────────────────────────────── */

export const BOLUM_BASLIGI =
  "m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream";

/** Tam sayfa EmptyState'e (404, hata) sitenin başlık dili: başlık bölüm
 *  başlığı ölçüsünde/kreminde, açıklama 16px · #a3a3a3 · en çok 420px,
 *  bloklar arası 28px. EmptyState başlık/açıklama öğelerine sınıf almıyor;
 *  Astryx'in kendi tema sınıfları (astryx-empty-state-*) üzerinden verilir.
 *  Başlık+açıklama sarmalayıcısı Astryx'te en çok 360px — sitenin büyük
 *  başlığı iki satıra kırılmasın diye kaldırılıyor. */
export const BOS_SAYFA = [
  "gap-28",
  "[&>:has(>.astryx-empty-state-title)]:max-w-none [&>:has(>.astryx-empty-state-title)]:gap-12",
  "[&_.astryx-empty-state-title]:m-0 [&_.astryx-empty-state-title]:font-display [&_.astryx-empty-state-title]:text-h2 [&_.astryx-empty-state-title]:leading-h2 [&_.astryx-empty-state-title]:font-bold [&_.astryx-empty-state-title]:tracking-h2 [&_.astryx-empty-state-title]:text-cream",
  "[&_.astryx-empty-state-description]:m-0 [&_.astryx-empty-state-description]:max-w-[420px] [&_.astryx-empty-state-description]:text-16 [&_.astryx-empty-state-description]:leading-16 [&_.astryx-empty-state-description]:text-muted",
].join(" ");

export function UstBaslik({ children }: { children: React.ReactNode }) {
  return (
    <Text
      type="label"
      color="accent"
      className="text-12 font-semibold tracking-eyebrow uppercase"
    >
      {children}
    </Text>
  );
}

export function BolumBasligi({
  ust,
  baslik,
  seviye = 2,
}: {
  ust: string;
  baslik: string;
  seviye?: 1 | 2;
}) {
  return (
    <VStack gap={3}>
      <UstBaslik>{ust}</UstBaslik>
      <Heading level={seviye} className={BOLUM_BASLIGI}>
        {baslik}
      </Heading>
    </VStack>
  );
}
