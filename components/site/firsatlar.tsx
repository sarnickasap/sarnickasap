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
   ────────────────────────────────────────────────────────────────────────── */

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
      <div className="mx-auto flex max-w-[1280px] flex-col gap-32 px-24 py-72">
        <div className="flex flex-wrap items-end justify-between gap-16">
          <div className="flex flex-col gap-10">
            <span className="text-12 font-semibold tracking-eyebrow uppercase text-cream">
              Günün ve haftanın fırsatları
            </span>
            <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-white">
              Bu hafta tezgâhta
            </h2>
          </div>
          <p className="m-0 max-w-[380px] text-15 leading-155 text-white">
            {sepetli ? ACIKLAMA.siparisli : ACIKLAMA.siparissiz}
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-16">
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
        </div>
      </div>
    </section>
  );
}
