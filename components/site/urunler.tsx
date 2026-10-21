import { UrunListesi } from "./urun-listesi";
import type { UrunVerisi } from "./urun-karti";

/* ──────────────────────────────────────────────────────────────────────────
   Ürünler Bölümü — vault "Urunler Bolumu" notundan birebir.
     section  max-w 1280 · mx-auto · p 112px 24px · flex-col · gap36
     başlık   flex-col · gap12 · max-w 640
       eyebrow 12px/600 · ls .12em · uppercase · #e0464e
       h2      DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em · #f8efea
       p       16px · lh1.6 · #a3a3a3
   ────────────────────────────────────────────────────────────────────────── */

export function Urunler({
  urunler,
  kategoriler,
  whatsapp,
}: {
  urunler: UrunVerisi[];
  kategoriler: string[];
  whatsapp: string;
}) {
  return (
    <section
      id="urunler"
      className="mx-auto flex max-w-[1280px] flex-col gap-36 px-24 py-112"
    >
      <div className="flex max-w-[640px] flex-col gap-12">
        <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
          Ürünler ve fiyatlar
        </span>
        <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
          Kilo fiyatları
        </h2>
        <p className="m-0 text-16 leading-16 text-muted">
          Fiyatlar kilogram başınadır ve günlük güncellenir. İstediğiniz kesim
          ve gramajı WhatsApp’tan yazın.
        </p>
      </div>

      <UrunListesi
        urunler={urunler}
        kategoriler={kategoriler}
        whatsapp={whatsapp}
      />
    </section>
  );
}
