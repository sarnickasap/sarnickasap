import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { FirsatKarti, type FirsatVerisi } from "./firsat-karti";
import { KatalogFirsatKarti, type KatalogFirsati } from "./katalog-firsat-karti";

/* ──────────────────────────────────────────────────────────────────────────
   Fırsatlar Bölümü — vault "Firsatlar Bolumu" notundan birebir.

     section  bg #b8222a                       ← sitedeki tek "ters" alan
     iç       max-w 1280 · mx-auto · p 72px 24px · flex-col · gap32
     üst      flex-wrap · items-end · justify-between · gap16
       sol      flex-col · gap10
         eyebrow  12px/600 · ls .12em · uppercase · #f8efea  (diğer bölümlerde #e0464e)
         h2       DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em · BEYAZ
       p        max-w 380 · 15px · lh 1.55 · beyaz
     ızgara   auto-fill minmax(min(100%,280px),1fr) · gap16

   Aktif fırsat yoksa bölüm HİÇ render edilmez (tasarımdaki sc-if hasDeals).

   Aşama 4: önce stok programı kampanyaları (listPrice dolu, stokta),
   ardından panelin "Kampanyalar" sekmesindeki fırsatlar — ikisi de aynı
   ızgarada, aynı kart çerçevesiyle.

   Astryx: VStack/HStack, Heading (h2), Text, Grid (`max` → min(100%,280px)
   tabanlı, telefonda taşmaz). `grid` sınıfı e2e seçicisi için
   (`#firsatlar .grid > div`).
   ────────────────────────────────────────────────────────────────────────── */

const EN_COK_SUTUN = 4;

const ACIKLAMA = {
  siparisli:
    "Fırsat ürünleri stokla sınırlıdır. Sepete ekleyebilir ya da WhatsApp’tan ayırtabilirsiniz.",
  siparissiz:
    "Fırsat ürünleri stokla sınırlıdır. Ayırtmak için WhatsApp’tan yazmanız yeterli.",
} as const;

export function Firsatlar({
  firsatlar,
  katalogFirsatlari = [],
  whatsapp,
  siparisAcik = false,
}: {
  firsatlar: FirsatVerisi[];
  katalogFirsatlari?: KatalogFirsati[];
  whatsapp: string;
  siparisAcik?: boolean;
}) {
  if (firsatlar.length === 0 && katalogFirsatlari.length === 0) return null;
  const sepetli = siparisAcik && katalogFirsatlari.length > 0;

  return (
    <section id="firsatlar" className="bg-brand">
      <VStack gap={8} className="mx-auto max-w-[1280px] px-24 py-72">
        <HStack wrap="wrap" align="end" justify="between" gap={4}>
          <VStack className="gap-10">
            <Text weight="semibold" className="text-12 tracking-eyebrow uppercase text-cream">
              Günün ve haftanın fırsatları
            </Text>
            <Heading level={2} className="font-display text-h2 leading-h2 font-bold tracking-h2 text-white">
              Bu hafta tezgâhta
            </Heading>
          </VStack>
          <Text as="p" className="max-w-[380px] text-15 leading-155 text-white">
            {sepetli ? ACIKLAMA.siparisli : ACIKLAMA.siparissiz}
          </Text>
        </HStack>

        <Grid columns={{ minWidth: 280, max: EN_COK_SUTUN }} gap={4} className="grid">
          {katalogFirsatlari.map((f) => (
            <KatalogFirsatKarti
              key={f.anahtar}
              firsat={f}
              whatsapp={whatsapp}
              siparisAcik={siparisAcik}
            />
          ))}
          {firsatlar.map((f) => (
            <FirsatKarti key={f.id} firsat={f} whatsapp={whatsapp} />
          ))}
        </Grid>
      </VStack>
    </section>
  );
}
